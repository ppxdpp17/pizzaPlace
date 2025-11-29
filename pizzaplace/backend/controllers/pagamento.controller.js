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
    console.log("criarSessaoCheckout payload:", { produtos: produtos?.length, codigoCupao, tipoEntrega, pedidoLocation });

    if (!Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).json({ msg: "Conjunto de produtos vazio ou inválido" });
    }

    if (!pedidoLocation) {
      return res.status(400).json({ msg: "A localização/loja é obrigatória." });
    }

    // Normalizar produtos para calcular total corretamente
    const items = await normalizeProdutosForPedido(
      produtos.map(p => ({ produto: p.produto ?? p._id ?? p.id, quantidade: p.quantidade, meta: p.meta ?? undefined }))
    );

    let precoTotal = items.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

    let cupao = null;
    if (codigoCupao) {
      cupao = await Cupao.findOne({ codigo: codigoCupao, userId: req.user._id, ativo: true });
      if (cupao) {
        precoTotal -= (precoTotal * cupao.percentagemDesconto) / 100;
      }
    }

    // Simulação MBWay - Retornar sucesso imediato com ID de pedido
    // Na vida real, aqui chamaria a API da SIBS/MBWay

    const pedido = await Pedido.create({
      user: req.user._id,
      produtos: items,
      total: precoTotal,
      tipoEntrega,
      metodoPagamento: "mbway",
      shippingAddress: {
        name: req.user.name, // Simplificação
        line1: "Online Payment",
        country: "PT"
      },
      estado: "A Cozinhar",
      localizacao: pedidoLocation
    });

    if (cupao) {
      await Cupao.findByIdAndUpdate(cupao._id, { ativo: false });
    }

    // Se gastar mais de 100 euros
    if (precoTotal >= 100) {
      await criarNovoCupao(req.user._id);
    }

    // Limpar carrinho
    try {
      await User.findByIdAndUpdate(req.user._id, { $set: { itensCarrinho: [] } });
    } catch (err) {
      console.warn("Falha ao limpar carrinho", err);
    }

    res.status(200).json({
      id: "mbway_sim_" + pedido._id,
      url: `${process.env.CLIENT_URL}/purchase-success?session_id=mbway_sim_${pedido._id}&pedidoId=${pedido._id}`
    });

  } catch (error) {
    console.log("Erro ao criar pagamento MBWay", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
}

async function criarCupaoStripe(percentagemDesconto) {
  // Mock function or remove if not needed
  return "mock_coupon_id";
}

async function criarNovoCupao(userId) {
  await Cupao.findOneAndDelete({ userId });
  const novoCupao = new Cupao({
    codigo: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    percentagemDesconto: 10,
    dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //Expira em 30 dias
    userId: userId
  })

  await novoCupao.save();

  return novoCupao;
}

export const sucessoCheckout = async (req, res) => {
  try {
    const { sessaoId } = req.body;

    // Se for simulação MBWay
    if (sessaoId.startsWith("mbway_sim_")) {
      const pedidoId = sessaoId.replace("mbway_sim_", "");
      const pedido = await Pedido.findById(pedidoId);
      if (!pedido) return res.status(404).json({ msg: "Pedido não encontrado" });

      return res.status(200).json({
        success: true,
        msg: "Pagamento MBWay confirmado",
        pedidoId: pedido._id
      });
    }

    const sessao = await stripe.checkout.sessions.retrieve(sessaoId);

    if (sessao.payment_status === "paid") {
      const pedidoExistente = await Pedido.findOne({ stripeSessionID: sessaoId });
      if (pedidoExistente) {
        return res.status(200).json({
          success: true,
          msg: "Pedido já foi criado anteriormente.",
          pedidoId: pedidoExistente._id
        });
      }

      if (sessao.metadata.codigoCupao) {
        await Cupao.findOneAndUpdate({
          codigo: sessao.metadata.codigoCupao, userId: sessao.metadata.userId
        }, {
          ativo: false
        });
      }

      const ship = sessao.collected_information?.shipping_details;
      if (!ship) {
        return res.status(400).json({ msg: "Não foi possível ler a morada do cliente." });
      }

      const shippingAddress = {
        name: ship.name,
        line1: ship.address.line1,
        line2: ship.address.line2,
        city: ship.address.city,
        postal_code: ship.address.postal_code,
        country: ship.address.country
      };

      // evitar duplicados
      const pedidoExistente2 = await Pedido.findOne({ stripeSessionID: sessaoId });
      if (pedidoExistente2) {
        return res.status(200).json({
          success: true,
          msg: "Pedido já existente",
          pedidoId: pedidoExistente2._id
        });
      }

      // normalizar produtos do metadata (pode conter ids custom)
      // --> garantir que passamos tamanho dentro de meta para normalizeProdutosForPedido
      const produtosRaw = JSON.parse(sessao.metadata.produtos || "[]");

      const produtosParaNormalizar = produtosRaw.map(p => ({
        produto: p.id ?? p._id ?? p,
        quantidade: p.quantidade ?? 1,
        // preservar meta e tamanho explicitamente
        meta: {
          ...(p.meta || {}),
          ...(p.tamanho ? { tamanho: p.tamanho } : {})
        }
      }));

      const produtos = await normalizeProdutosForPedido(produtosParaNormalizar);

      const total = produtos.reduce((s, it) => s + (it.preco * (it.quantidade || 1)), 0);

      // Usar upsert atómico para evitar race conditions / duplicados
      const filter = { stripeSessionID: sessaoId };
      const update = {
        $setOnInsert: {
          user: sessao.metadata.userId,
          produtos,
          tipoEntrega: sessao.metadata.tipoEntrega,
          total,
          stripeSessionID: sessaoId,
          metodoPagamento: sessao.metadata.metodoPagamento,
          shippingAddress,
          estado: "A Cozinhar",
          localizacao: sessao.metadata.pedidoLocation,
        }
      };
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      };

      // Faz o upsert — se já existir, retorna o documento existente sem duplicar
      const savedPedido = await Pedido.findOneAndUpdate(filter, update, options);

      // Limpar itensCarrinho do user (defensivo — não falhar se já limpou)
      try {
        await User.findByIdAndUpdate(
          sessao.metadata.userId,
          { $set: { itensCarrinho: [] } },
          { new: true }
        );
      } catch (err) {
        console.warn("Falha ao limpar itensCarrinho do user (prosseguir):", err.message);
      }

      // Respondemos com o pedido (novo ou existente)
      return res.status(200).json({
        success: true,
        msg: "Pagamento efetuado com sucesso, pedido feito e cupão desativado (se usado)",
        pedidoId: savedPedido._id
      });

    }

    return res.status(400).json({ msg: "Pagamento não finalizado." });
  } catch (error) {
    console.error("Erro ao criar pedido (sucessoCheckout):", error);
    return res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

export const cashPayment = async (req, res) => {
  try {
    const { produtos: rawProdutos, tipoEntrega, pedidoLocation, shippingAddress } = req.body;
    console.log("cashPayment payload:", { produtos: rawProdutos?.length, tipoEntrega, pedidoLocation, shippingAddress });

    if (!Array.isArray(rawProdutos) || rawProdutos.length === 0) {
      return res.status(400).json({ msg: "Carrinho vazio" });
    }
    if (!shippingAddress || !shippingAddress.line1) {
      return res.status(400).json({ msg: "Morada obrigatória" });
    }

    // --- CORREÇÃO AQUI ---
    // Alterada a ordem: p.produto vem primeiro, depois p._id
    const items = await normalizeProdutosForPedido(
      rawProdutos.map(p => ({
        produto: p.produto ?? p._id ?? p.id, // <--- AQUI ESTAVA O ERRO
        quantidade: p.quantidade,
        meta: p.meta ?? undefined
      }))
    );

    // calcular total server-side
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

    // limpar carrinho do user persistido (se aplicável)
    try {
      await User.findByIdAndUpdate(req.user._id, { $set: { itensCarrinho: [] } });
    } catch (err) {
      console.warn("Falha ao limpar itensCarrinho do user (prosseguir):", err.message);
    }

    return res.status(201).json({ success: true, pedidoId: pedido._id });
  } catch (err) {
    console.error("Erro cashPayment:", err);
    if (err?.status && err?.message) {
      return res.status(err.status).json({ msg: err.message });
    }
    return res.status(500).json({ msg: "Erro no servidor", error: err.message ?? String(err) });
  }
};


async function normalizeProdutosForPedido(rawProdutos = []) {
  const normalized = [];

  for (const raw of rawProdutos) {
    // Pode vir no shape { _id, quantidade, preco, meta } ou { produto, quantidade, preco, meta }
    let produtoField = raw.produto ?? raw._id ?? raw.productId ?? raw.product ?? raw;
    // se for object com _id
    if (typeof produtoField === "object" && produtoField !== null && produtoField._id) {
      produtoField = String(produtoField._id);
    } else {
      produtoField = String(produtoField ?? "");
    }

    let quantidade = Number(raw.quantidade ?? raw.qty ?? 1);
    if (isNaN(quantidade) || quantidade < 1) quantidade = 1;

    let tamanho;
    // Se o id não for um ObjectId válido, tenta parsear o custom id
    if (!mongoose.Types.ObjectId.isValid(produtoField)) {
      const parsed = parseCustomId(produtoField);
      if (parsed) {
        produtoField = parsed.baseId;
        tamanho = parsed.tamanho;
      } else if (typeof raw.meta === "object" && raw.meta?.tamanho && mongoose.Types.ObjectId.isValid(String(raw.produto?._id ?? raw.produto))) {
        // Caso cliente tenha enviado objecto produto com meta
        tamanho = raw.meta.tamanho;
        produtoField = String(raw.produto._id ?? raw.produto);
      } else {
        throw { status: 400, message: `Produto inválido recebido: ${produtoField}` };
      }
    }

    if (!mongoose.Types.ObjectId.isValid(produtoField)) {
      throw { status: 400, message: `Produto inválido recebido: ${produtoField}` };
    }

    // buscar produto actual no DB para ter o preço canónico
    const produtoDoc = await Produto.findById(produtoField).lean();
    if (!produtoDoc) {
      console.error(`Produto não encontrado: ${produtoField}`);
      throw { status: 400, message: `Produto não existe ou foi removido.`, code: "INVALID_PRODUCT", invalidId: produtoField };
    }

    // recalcular preço no servidor
    // Se tiveres preço por tamanho armazenado no produto (ex: produto.preco_por_tamanho), usa-o;
    // caso contrário aplica multiplicadores.
    let precoCalc = Number(produtoDoc.preco ?? 0);
    if (tamanho) {
      // preferir campo explícito se existir
      const precoPorTamanho = produtoDoc.preco_por_tamanho ?? produtoDoc.precos_por_tamanho ?? null;
      if (precoPorTamanho && typeof precoPorTamanho === "object" && precoPorTamanho[tamanho] != null) {
        precoCalc = Number(precoPorTamanho[tamanho]);
      } else {
        const mult = PRICE_MULTIPLIERS[tamanho] ?? 1.0;
        precoCalc = Number((precoCalc * mult).toFixed(2));
      }
    } else {
      precoCalc = Number(precoCalc);
    }

    const entry = {
      produto: new mongoose.Types.ObjectId(produtoField),
      quantidade,
      preco: precoCalc
    };

    // opcional: guardar tamanho/meta se quiseres (se o schema aceitar)
    if (tamanho) entry.tamanho = tamanho;
    if (raw.meta) entry.meta = raw.meta;

    normalized.push(entry);
  }

  return normalized;
}