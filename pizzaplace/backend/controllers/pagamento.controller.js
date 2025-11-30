import { stripe } from "../lib/stripe.js";
import Cupao from "../models/cupao.model.js";
import Pedido from "../models/pedidos.model.js";
import mongoose from "mongoose";
import Produto from "../models/produto.model.js";
import User from "../models/user.model.js";

const PRICE_MULTIPLIERS = {
  pequena: 1.0,
  media: 1.2,
  grande: 1.4,
  small: 1.0,
  medium: 1.2,
  large: 1.4
};

function parseCustomId(idStr) {
  if (typeof idStr !== "string") return null;
  // Allow any alphanumeric string for size
  const m = idStr.match(/^([a-fA-F0-9]{24})_t_([a-zA-Z0-9]+)_(\d+)$/);
  if (!m) return null;
  return { baseId: m[1], tamanho: m[2] };
}

export const criarSessaoCheckout = async (req, res) => {
  try {
    const { produtos, codigoCupao, tipoEntrega, pedidoLocation } = req.body;

    if (!Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).json({ msg: "Carrinho vazio" });
    }
    if (!pedidoLocation) {
      return res.status(400).json({ msg: "A localização/loja é obrigatória." });
    }

    // 1. Normalizar Produtos (Aqui obtemos Nome e Imagem da BD enquanto o produto existe)
    const items = await normalizeProdutosForPedido(produtos, true); // true = Strict Mode (erro se não existir)

    // Calcular Total
    let precoTotal = items.reduce((sum, i) => sum + i.preco * i.quantidade, 0);
    let cupao = null;

    // 2. Processar Cupão
    if (codigoCupao) {
      cupao = await Cupao.findOne({ codigo: codigoCupao, userId: req.user._id, ativo: true });
      if (cupao) {
        precoTotal -= (precoTotal * cupao.percentagemDesconto) / 100;
      }
    }

    // 3. CRIAR PEDIDO NA BD (ESTADO: AGUARDANDO PAGAMENTO)
    // Guardamos o "Snapshot" do nome e imagem AGORA.
    const novoPedido = await Pedido.create({
      user: req.user._id,
      produtos: items, // Já contém nome e imagem
      total: precoTotal,
      tipoEntrega,
      metodoPagamento: "stripe",
      // Para stripe checkout, o shippingAddress é atualizado depois, mas se for takeaway criamos dummy
      shippingAddress: tipoEntrega === 'takeaway' ? {
        name: req.user.name || "Cliente Takeaway",
        line1: "Levantamento em Loja",
        line2: pedidoLocation,
        city: "Takeaway",
        postal_code: "0000-000",
        country: "PT"
      } : undefined,
      estado: "Aguardando Pagamento",
      localizacao: pedidoLocation
    });

    // 4. Preparar Stripe
    // Nota: O Stripe precisa de valores inteiros (cêntimos)
    const lineItems = items.map((item) => {
      // Validar URL da imagem para o Stripe
      const imagensValidas = (item.imagem && item.imagem.startsWith("http"))
        ? [item.imagem]
        : [];

      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: item.nome, // Nome correto
            images: imagensValidas, // Imagem validada
          },
          unit_amount: Math.round(item.preco * 100),
        },
        quantity: item.quantidade,
      };
    });

    // Configurar desconto no Stripe
    let discounts = [];
    if (cupao) {
      const stripeCoupon = await stripe.coupons.create({
        percent_off: cupao.percentagemDesconto,
        duration: 'once',
        name: cupao.codigo
      });
      discounts.push({ coupon: stripeCoupon.id });
    }

    // 5. Criar Sessão Stripe
    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      billing_address_collection: "required",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/`,
      discounts: discounts,
      metadata: {
        pedidoId: novoPedido._id.toString(), // CRÍTICO: Passamos o ID do pedido que já criámos
        userId: req.user._id.toString(),
        cupaoId: cupao ? cupao._id.toString() : ""
      }
    };

    // Apenas pedir morada no Stripe se for Delivery
    if (tipoEntrega === 'delivery') {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ["PT"]
      };
    }

    const sessao = await stripe.checkout.sessions.create(sessionConfig);

    // Guardar o ID da sessão no pedido para referência futura
    novoPedido.stripeSessionID = sessao.id;
    await novoPedido.save();

    res.status(200).json({ id: sessao.id, url: sessao.url });

  } catch (error) {
    console.error("Erro checkout:", error);
    res.status(500).json({ msg: "Erro servidor", error: error.message });
  }
}

async function criarCupaoStripe(percentagemDesconto) {
  const cupao = await stripe.coupons.create({
    percent_off: percentagemDesconto,
    duration: "once"
  })

  return cupao.id;
}

async function criarNovoCupao(userId) {
  await Cupao.findOneAndDelete({ userId });
  const novoCupao = new Cupao({
    codigo: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    percentagemDesconto: 10,
    dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId
  })
  await novoCupao.save();
}


export const sucessoCheckout = async (req, res) => {
  try {
    const { sessaoId } = req.body;
    const sessao = await stripe.checkout.sessions.retrieve(sessaoId);

    if (sessao.payment_status === "paid") {

      const { pedidoId, userId, cupaoId } = sessao.metadata;

      // 1. Buscar o pedido JÁ EXISTENTE
      const pedido = await Pedido.findById(pedidoId);

      if (!pedido) {
        // Caso raro: pedido não encontrado (não devia acontecer neste fluxo)
        return res.status(404).json({ msg: "Pedido não encontrado." });
      }

      // Se já estiver pago, retorna sucesso sem fazer nada
      if (pedido.estado !== "Aguardando Pagamento") {
        return res.status(200).json({ success: true, pedidoId: pedido._id });
      }

      // 2. Recolher Morada do Stripe
      const ship = sessao.shipping_details || sessao.customer_details;
      const shippingAddress = {
        name: ship?.name || "Cliente",
        line1: ship?.address?.line1 || "N/A",
        line2: ship?.address?.line2 || "",
        city: ship?.address?.city || "",
        postal_code: ship?.address?.postal_code || "",
        country: ship?.address?.country || "PT"
      };

      // 3. ATUALIZAR PEDIDO (Sem tocar no array 'produtos'!)
      // Apenas mudamos o estado, a morada e o ID do pagamento.
      // Os nomes e imagens dos produtos mantêm-se os originais (Snapshot).
      pedido.estado = "A Cozinhar";
      pedido.stripeSessionID = sessaoId;
      pedido.paymentId = sessao.payment_intent;

      // Só atualizamos a morada se for Delivery (se for takeaway já está certa)
      if (pedido.tipoEntrega === 'delivery') {
        pedido.shippingAddress = shippingAddress;
      }

      await pedido.save();

      // 4. Consumir Cupão e Limpar Carrinho
      if (cupaoId) {
        await Cupao.findByIdAndUpdate(cupaoId, { ativo: false });
      }

      if (sessao.amount_total >= 10000) {
        await criarNovoCupao(userId);
      }

      try {
        await User.findByIdAndUpdate(userId, { $set: { itensCarrinho: [] } });
      } catch (err) { console.warn(err); }

      return res.status(200).json({
        success: true,
        msg: "Pedido confirmado.",
        pedidoId: pedido._id
      });
    }

    return res.status(400).json({ msg: "Pagamento não confirmado." });

  } catch (error) {
    console.error("Erro sucessoCheckout:", error);
    return res.status(500).json({ msg: "Erro ao processar sucesso", error: error.message });
  }
};


export const cashPayment = async (req, res) => {
  try {
    const { produtos, tipoEntrega, pedidoLocation, shippingAddress } = req.body;

    if (!produtos?.length) return res.status(400).json({ msg: "Carrinho vazio" });

    // Normaliza (Snapshot)
    const items = await normalizeProdutosForPedido(produtos, true);
    const total = items.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

    const pedido = await Pedido.create({
      user: req.user._id,
      produtos: items,
      total,
      tipoEntrega,
      metodoPagamento: "dinheiro",
      shippingAddress,
      estado: "A Cozinhar",
      localizacao: pedidoLocation
    });

    await User.findByIdAndUpdate(req.user._id, { $set: { itensCarrinho: [] } });
    return res.status(201).json({ success: true, pedidoId: pedido._id });

  } catch (err) {
    console.error("Erro cashPayment:", err);
    res.status(err.status || 500).json({ msg: err.message });
  }
};


// Função auxiliar para validar e formatar produtos
async function normalizeProdutosForPedido(rawProdutos = [], strictMode = true) {
  const normalized = [];

  for (const raw of rawProdutos) {
    let produtoField = raw.produto ?? raw._id ?? raw.productId ?? raw.product ?? raw;

    if (typeof produtoField === "object" && produtoField?._id) {
      produtoField = String(produtoField._id);
    } else {
      produtoField = String(produtoField ?? "");
    }

    let quantidade = Number(raw.quantidade ?? raw.qty ?? 1);
    if (isNaN(quantidade) || quantidade < 1) quantidade = 1;

    let tamanho;
    if (!mongoose.Types.ObjectId.isValid(produtoField)) {
      const parsed = parseCustomId(produtoField);
      if (parsed) {
        produtoField = parsed.baseId;
        tamanho = parsed.tamanho;
      } else if (raw.meta?.tamanho) {
        tamanho = raw.meta.tamanho;
        if (raw.produto && (raw.produto._id || mongoose.Types.ObjectId.isValid(raw.produto))) {
          produtoField = String(raw.produto._id || raw.produto);
        }
      }
    } else if (raw.meta?.tamanho || raw.tamanho) {
      tamanho = raw.meta?.tamanho || raw.tamanho;
    }

    if (!mongoose.Types.ObjectId.isValid(produtoField)) {
      // FIX: Se for um item custom ou mix (que não existe na BD como produto único),
      // e tivermos os dados no payload (nome, preço, etc), usamos esses dados.
      if (produtoField.startsWith("mix-2-") || produtoField.startsWith("custom-")) {
        normalized.push({
          produto: new mongoose.Types.ObjectId("000000000000000000000000"), // Dummy ID
          quantidade,
          preco: Number(raw.preco || 0),
          nome: raw.nome || "Produto Personalizado",
          imagem: raw.imagem || "",
          tamanho: tamanho || null,
          meta: raw.meta || {}
        });
        continue;
      }

      if (strictMode) throw { status: 400, message: `ID inválido: ${produtoField}` };
    }

    // Buscar produto
    const produtoDoc = await Produto.findById(produtoField).lean();

    if (!produtoDoc) {
      if (strictMode) {
        throw { status: 400, message: `Produto não encontrado: ${produtoField}` };
      } else {
        // Fallback apenas para leituras legacy, não deve acontecer na criação
        normalized.push({
          produto: new mongoose.Types.ObjectId(produtoField),
          quantidade,
          preco: Number(raw.preco || 0),
          nome: "Produto Removido/Descontinuado",
          imagem: "",
          tamanho: tamanho || null,
          meta: raw.meta || {}
        });
        continue;
      }
    }

    let precoCalc = Number(produtoDoc.preco ?? 0);
    if (tamanho) {
      const precoPorTamanho = produtoDoc.preco_por_tamanho ?? produtoDoc.precos_por_tamanho ?? null;
      if (precoPorTamanho && typeof precoPorTamanho === "object" && precoPorTamanho[tamanho] != null) {
        precoCalc = Number(precoPorTamanho[tamanho]);
      } else {
        const mult = PRICE_MULTIPLIERS[tamanho] ?? 1.0;
        precoCalc = Number((precoCalc * mult).toFixed(2));
      }
    }

    normalized.push({
      produto: new mongoose.Types.ObjectId(produtoField),
      quantidade,
      preco: precoCalc,
      // SNAPSHOT: Aqui garantimos que o nome e imagem são guardados
      nome: produtoDoc.nome,
      imagem: produtoDoc.imagem,
      tamanho: tamanho || null,
      meta: raw.meta || {}
    });
  }

  return normalized;
}