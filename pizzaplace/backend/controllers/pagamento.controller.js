import { stripe } from "../lib/stripe.js";
import Cupao from "../models/cupao.model.js";
import Pedido from "../models/pedidos.model.js";
import mongoose from "mongoose";
import Produto from "../models/produto.model.js";
import User from "../models/user.model.js";

const PRICE_MULTIPLIERS = {
  pequena: 1.0,
  media: 1.2,
  grande: 1.4
};

function parseCustomId(idStr) {
  if (typeof idStr !== "string") return null;
  const m = idStr.match(/^([a-fA-F0-9]{24})_t_(pequena|media|grande)_(\d+)$/);
  if (!m) return null;
  return { baseId: m[1], tamanho: m[2] };
}

export const criarSessaoCheckout = async (req, res) => {
    try {
        const {produtos, codigoCupao, tipoEntrega, pedidoLocation} = req.body;

        if(!Array.isArray(produtos) || produtos.length === 0)
        {
            return res.status(400).json({msg: "Conjunto de produtos vazio ou inválido"});
        }

        if (!pedidoLocation) 
        {
            return res.status(400).json({ msg: "A localização/loja é obrigatória." });
        }

        let precoTotal = 0;

        const linhaItems = produtos.map((produto) => {
            const precoInicial = Math.round(produto.preco * 100); //Porque o valor é em cêntimos no stripe
            precoTotal += precoInicial * produto.quantidade;


            return {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: produto.nome,
                        images: [produto.imagem],
                    },
                    unit_amount: precoInicial
                },
                quantity: produto.quantidade || 1

            };
        });

        let cupao = null;
        if(codigoCupao)
        {
            cupao = await Cupao.findOne({codigo: codigoCupao, userId: req.user._id, ativo: true });
            if(cupao)
            {
                precoTotal -= Math.round((precoTotal * cupao.percentagemDesconto) / 100);
            }
        }

        const sessao = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: linhaItems,
            mode: "payment",
            billing_address_collection: "required",
            shipping_address_collection: {
                allowed_countries: ["PT"]  
            },
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: cupao ? [{coupon: await criarCupaoStripe(cupao.percentagemDesconto)}] : [],
            metadata: {
                userId: req.user._id.toString(),
                codigoCupao: codigoCupao || "",
                tipoEntrega: tipoEntrega,
                metodoPagamento: "cartao",
                produtos: JSON.stringify(produtos.map(p => ({
                  id: p._id,
                  quantidade: p.quantidade,
                  preco: p.preco,
                  tamanho: p.meta?.tamanho ?? p.tamanho ?? null
                }))),
                pedidoLocation: pedidoLocation,
            }
        });

        //Se ele gastar 100 euros ou + numa só compra, oferecemos um cupão de desconto de 10%
        if(precoTotal >= 10000)
        {
            await criarNovoCupao(req.user._id);
        }

        res.status(200).json({id: sessao.id, precoTotal: precoTotal / 100});

    } catch (error) {  
        console.log("Erro ao criar sessão de checkout", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
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
    await Cupao.findOneAndDelete({userId});
    const novoCupao = new Cupao({
        codigo: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        percentagemDesconto: 10,
        dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //Expira em 30 dias
        userId: userId
    })

    await novoCupao.save();

    return novoCupao;
}

export const sucessoCheckout = async(req, res) => {
  try {
    const {sessaoId} = req.body;
    const sessao = await stripe.checkout.sessions.retrieve(sessaoId);

    if(sessao.payment_status === "paid") {
      const pedidoExistente = await Pedido.findOne({ stripeSessionID: sessaoId });
      if (pedidoExistente) {
        return res.status(200).json({
          success: true,
          msg: "Pedido já foi criado anteriormente.",
          pedidoId: pedidoExistente._id
        });
      }

      if(sessao.metadata.codigoCupao) {
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
        name:        ship.name,
        line1:       ship.address.line1,
        line2:       ship.address.line2,
        city:        ship.address.city,
        postal_code: ship.address.postal_code,
        country:     ship.address.country
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
      const produtosRaw = JSON.parse(sessao.metadata.produtos || "[]");
      const produtos = await normalizeProdutosForPedido(
        produtosRaw.map(p => ({ produto: p.id ?? p._id ?? p, quantidade: p.quantidade, meta: p.meta ?? undefined }))
      );

      const total = produtos.reduce((s, it) => s + (it.preco * (it.quantidade || 1)), 0);

      const novoPedido = new Pedido({
        user: sessao.metadata.userId,
        produtos,
        tipoEntrega: sessao.metadata.tipoEntrega,
        total,
        stripeSessionID: sessaoId,
        metodoPagamento: sessao.metadata.metodoPagamento,
        shippingAddress,
        estado: "A Cozinhar",
        localizacao: sessao.metadata.pedidoLocation,
      });

      await User.findByIdAndUpdate(
          sessao.metadata.userId,
          { $set: { itensCarrinho: [] } },
          { new: true }
      );

      await novoPedido.save();

      return res.status(200).json({
        success: true,
        msg: "Pagamento efetuado com sucesso, pedido feito e cupão desativado (se usado)",
        pedidoId: novoPedido._id
      });
    }

    return res.status(400).json({ msg: "Pagamento não finalizado." });
  } catch (error) {
    console.error("Erro ao criar pedido (sucessoCheckout):", error);
    return res.status(500).json({msg: "Erro no servidor", error: error.message});
  }
};


export const cashPayment = async (req, res) => {
  try {
    const { produtos: rawProdutos, tipoEntrega, pedidoLocation, shippingAddress } = req.body;

    if (!Array.isArray(rawProdutos) || rawProdutos.length === 0) {
      return res.status(400).json({ msg: "Carrinho vazio" });
    }
    if (!shippingAddress || !shippingAddress.line1) {
      return res.status(400).json({ msg: "Morada obrigatória" });
    }

    // Normaliza e valida no servidor
    const items = await normalizeProdutosForPedido(
      rawProdutos.map(p => ({ produto: p._id ?? p.produto ?? p.id, quantidade: p.quantidade, meta: p.meta ?? undefined }))
    );

    // calcular total server-side
    const total = items.reduce((sum,i) => sum + i.preco * i.quantidade, 0);

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
      throw { status: 400, message: `Produto não existe: ${produtoField}` };
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