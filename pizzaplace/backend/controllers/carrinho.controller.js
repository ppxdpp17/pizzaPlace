import Produto from "../models/produto.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const PRICE_MULTIPLIERS = {
  pequena: 1.0,
  media: 1.2,
  grande: 1.4
};

async function calcularPrecoServidor(produtoId, meta = {}) {
  const produtoDoc = await Produto.findById(produtoId).lean();
  if (!produtoDoc) throw new Error("Produto não existe");

  let precoBase = Number(produtoDoc.preco ?? 0);

  if (meta && meta.tipo === "mix-2") {
    const pA = await Produto.findById(meta.pizzaA).lean();
    const pB = await Produto.findById(meta.pizzaB).lean();
    if (!pA || !pB) throw new Error("Uma das pizzas do mix não existe");
    const soma = Number(pA.preco ?? 0) + Number(pB.preco ?? 0);
    const mult = PRICE_MULTIPLIERS[meta.tamanho] ?? 1.0;
    return Number((soma * mult).toFixed(2));
  }

  if (meta && meta.tamanho) {
    const mult = PRICE_MULTIPLIERS[meta.tamanho] ?? 1.0;
    return Number((precoBase * mult).toFixed(2));
  }

  return Number(precoBase);
}

/**
 * Constrói resposta para o cliente usando o _id do subdoc (i._id) como identificador único.
 * Garante fallback para mix-2 e para produtos removidos.
 */
async function buildItensCarrinhoResponse(itens) {
  // Collect product ids to fetch
  const productIds = itens
    .map(i => i.produto)
    .filter(id => mongoose.Types.ObjectId.isValid(String(id)))
    .map(id => String(id));

  const produtos = productIds.length
    ? await Produto.find({ _id: { $in: productIds }, estaDisponivel: true }).populate("ingredientes", "nome icone").lean()
    : [];

  const prodMap = new Map(produtos.map(p => [String(p._id), p]));

  const result = await Promise.all(itens.map(async (i) => {
    // ensure we use the cart subdoc id (i._id) as primary identifier for the frontend
    const cartId = String(i._id ?? `cart_${String(i.produto ?? "")}_${Date.now()}`);

    const prod = prodMap.get(String(i.produto));
    if (prod) {
      return {
        // _id = subdoc id (único por item do carrinho)
        _id: cartId,
        produto: String(i.produto),
        nome: prod.nome,
        imagem: prod.imagem,
        imagens: prod.imagens ?? undefined,
        ingredientes: prod.ingredientes ?? undefined,
        quantidade: i.quantidade ?? 1,
        meta: i.meta ?? undefined,
        preco: (typeof i.preco === "number") ? i.preco : Number(i.preco ?? prod.preco ?? 0)
      };
    }

    // fallback para mix-2 (tentar preencher a imagem/nome)
    if (i.meta && i.meta.tipo === "mix-2") {
      const idsToFetch = [];
      if (i.meta.pizzaA) idsToFetch.push(i.meta.pizzaA);
      if (i.meta.pizzaB) idsToFetch.push(i.meta.pizzaB);

      const pizzas = idsToFetch.length ? await Produto.find({ _id: { $in: idsToFetch } }).lean() : [];
      const imgList = pizzas.map(p => p.imagem).filter(Boolean);
      const nomeA = pizzas.find(p => String(p._id) === String(i.meta.pizzaA))?.nome;
      const nomeB = pizzas.find(p => String(p._id) === String(i.meta.pizzaB))?.nome;
      const nomeMix = i.nome ?? (nomeA && nomeB ? `Mix 2 Pizzas — ${nomeA} + ${nomeB}` : "Mix 2 Pizzas");

      return {
        _id: cartId,
        produto: String(i.produto ?? ""),
        nome: nomeMix,
        imagem: imgList[0] ?? i.imagem ?? "/pizza2mix.png",
        imagens: imgList.length ? imgList : undefined,
        quantidade: i.quantidade ?? 1,
        meta: i.meta ?? undefined,
        preco: (typeof i.preco === "number") ? i.preco : Number(i.preco ?? 0)
      };
    }

    // fallback genérico quando produto não existe
    return {
      _id: cartId,
      produto: String(i.produto ?? ""),
      nome: i.nome ?? "Produto",
      imagem: i.imagem ?? "/placeholder.png",
      quantidade: i.quantidade ?? 1,
      meta: i.meta ?? undefined,
      preco: (typeof i.preco === "number") ? i.preco : Number(i.preco ?? 0)
    };
  }));

  return result.filter(Boolean);
}

/**
 * GET /carrinho
 */
export const getProdutosCarrinho = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ msg: "User not found" });

    const itens = user.itensCarrinho || [];
    if (itens.length === 0) return res.json([]);

    const itensCarrinho = await buildItensCarrinhoResponse(itens);
    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Error in getCartProducts controller", error);
    res.status(500).json({ message: "Server error", error: error.message || String(error) });
  }
};

/**
 * POST /carrinho
 * body: { productId, quantidade = 1, meta = {} }
 */
export const adicionarAoCarrinho = async (req, res) => {
  try {
    const { productId, quantidade = 1, meta = undefined } = req.body;
    if (!productId) return res.status(400).json({ msg: "productId required" });
    if (!mongoose.Types.ObjectId.isValid(String(productId))) return res.status(400).json({ msg: "productId inválido" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const precoUnit = await calcularPrecoServidor(productId, meta);

    const equalsMeta = (a, b) => {
      if (!a && !b) return true;
      try { return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {}); } catch { return false; }
    };

    let found = null;
    for (const it of user.itensCarrinho) {
      if (String(it.produto) === String(productId) && equalsMeta(it.meta, meta)) {
        found = it;
        break;
      }
    }

    if (found) {
      found.quantidade = (found.quantidade || 1) + Number(quantidade);
      found.preco = precoUnit;
    } else {
      user.itensCarrinho.push({
        produto: String(productId),
        quantidade: Number(quantidade),
        preco: precoUnit,
        meta: meta ?? undefined
      });
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).lean();
    const itens = updatedUser.itensCarrinho || [];
    const itensCarrinho = await buildItensCarrinhoResponse(itens);

    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Erro no controller de adicionarAoCarrinho", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * DELETE /carrinho  (body: { produtoID } )  => apagar item específico ou limpar se sem produtoID
 * DELETE /carrinho/:id  (param)  => apagar item específico (compatibilidade)
 */
export const removerTodosDoCarrinho = async (req, res) => {
  try {
    // aceitar param primeiro (DELETE /carrinho/:id) ou body.produtoID (DELETE /carrinho with body)
    const produtoID = req.params?.id ?? req.body?.produtoID ?? undefined;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!produtoID) {
      user.itensCarrinho = [];
    } else {
      // Tentar remover por _id do subdoc primeiro
      const idxBySubdoc = user.itensCarrinho.findIndex(i => String(i._id) === String(produtoID));
      if (idxBySubdoc !== -1) {
        user.itensCarrinho.splice(idxBySubdoc, 1);
      } else {
        // se não for subdocId, tentar remover por produto (product id)
        if (!mongoose.Types.ObjectId.isValid(String(produtoID))) {
          return res.status(400).json({ msg: "produtoID inválido" });
        }
        user.itensCarrinho = user.itensCarrinho.filter(item => String(item.produto) !== String(produtoID));
      }
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).lean();
    const itens = updatedUser.itensCarrinho || [];
    const itensCarrinho = await buildItensCarrinhoResponse(itens);

    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Erro ao remover do carrinho", error.message || error);
    res.status(500).json({ msg: "Erro no servidor", error: error.message ?? String(error) });
  }
};

/**
 * PUT /carrinho/:id => atualizar quantidade (id pode ser subdoc _id ou product id)
 * corpo { quantidade }
 */
export const atualizarQuantidade = async (req, res) => {
  try {
    const { id: paramId } = req.params;
    const { quantidade } = req.body;
    if (!paramId) return res.status(400).json({ msg: "id obrigatório" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // procurar por subdoc _id
    let item = user.itensCarrinho.find(i => String(i._id) === String(paramId));
    if (!item) {
      // se não for subdoc, assumir que é product id
      if (!mongoose.Types.ObjectId.isValid(String(paramId))) return res.status(400).json({ msg: "ID inválido" });
      item = user.itensCarrinho.find(i => String(i.produto) === String(paramId));
    }

    if (!item) return res.status(404).json({ msg: "Item nao encontrado" });

    if (Number(quantidade) <= 0) {
      // remover o item encontrado (por subdoc ou produto)
      user.itensCarrinho = user.itensCarrinho.filter(i =>
        !(String(i._id) === String(item._id) || String(i.produto) === String(item.produto))
      );
    } else {
      item.quantidade = Number(quantidade);
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).lean();
    const itens = updatedUser.itensCarrinho || [];
    const itensCarrinho = await buildItensCarrinhoResponse(itens);

    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Erro ao atualizar quantidade", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

export const validateCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const itens = user.itensCarrinho || [];
    if (itens.length === 0) return res.json({ valid: true, invalidItems: [] });

    const invalidItems = [];
    for (const item of itens) {
      let produtoId = String(item.produto);
      // Handle custom IDs if necessary, similar to payment controller
      // But usually cart items store the direct objectId or we can validate it.
      // For simplicity, we check if the product exists.

      if (mongoose.Types.ObjectId.isValid(produtoId)) {
        const exists = await Produto.exists({ _id: produtoId });
        if (!exists) {
          invalidItems.push({ ...item.toObject(), reason: "Produto não existe" });
        }
      } else {
        // If it's a custom ID (e.g. from a mix), we might need more complex logic
        // For now, let's assume if it's not a valid ObjectId, it might be invalid unless it's a special case
        // But the cart usually stores ObjectId in 'produto' field.
        invalidItems.push({ ...item.toObject(), reason: "ID inválido" });
      }
    }

    if (invalidItems.length > 0) {
      return res.json({ valid: false, invalidItems });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.error("Erro ao validar carrinho:", error);
    res.status(500).json({ msg: "Erro ao validar carrinho", error: error.message });
  }
};
