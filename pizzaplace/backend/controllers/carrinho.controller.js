// controllers/carrinho.controller.js
import Produto from "../models/produto.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const PRICE_MULTIPLIERS = { pequena: 1.0, media: 1.2, grande: 1.4 };

function calcPrecoProduto(produtoDoc, meta = {}) {
  let preco = Number(produtoDoc.preco ?? 0);
  const tamanho = meta?.tamanho;
  if (tamanho && PRICE_MULTIPLIERS[tamanho]) {
    preco = Number((preco * PRICE_MULTIPLIERS[tamanho]).toFixed(2));
  }
  return preco;
}

function buildClientItem(subdoc) {
  // subdoc: { _id, produto: populated doc | ObjectId, quantidade, preco, meta }
  const produto = subdoc.produto || {};
  return {
    _id: String(subdoc._id),                // id do item no carrinho (subdocument)
    produtoId: produto._id ? String(produto._id) : undefined,
    nome: produto.nome ?? subdoc.nome ?? "Produto",
    imagem: produto.imagem ?? subdoc.imagem ?? "/placeholder.png",
    ingredientes: produto.ingredientes ?? [],
    quantidade: subdoc.quantidade ?? 1,
    preco: typeof subdoc.preco === "number" ? subdoc.preco : Number(produto.preco ?? subdoc.preco ?? 0),
    meta: subdoc.meta ?? undefined,
  };
}

export const getProdutosCarrinho = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("itensCarrinho.produto", "nome imagem preco ingredientes")
      .lean();

    if (!user) return res.status(404).json({ msg: "User not found" });

    const itens = (user.itensCarrinho || []).map(buildClientItem).filter(Boolean);

    return res.json(itens);
  } catch (error) {
    console.error("Error in getCarrinho:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const adicionarAoCarrinho = async (req, res) => {
  try {
    const { productId, quantidade = 1, meta } = req.body;
    if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
      return res.status(400).json({ msg: "productId inválido" });
    }

    const produtoDoc = await Produto.findById(productId).lean();
    if (!produtoDoc) return res.status(404).json({ msg: "Produto não encontrado." });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Procurar um item existente com MESMO produto e MESMA meta.tamanho (se houver meta)
    const existeIdx = user.itensCarrinho.findIndex(it => {
      if (!it.produto) return false;
      if (String(it.produto) !== String(productId)) return false;
      // comparar meta.tamanho se ambos existirem (suficiente para o caso de tamanhos)
      const t1 = it.meta?.tamanho ?? null;
      const t2 = meta?.tamanho ?? null;
      return String(t1) === String(t2);
    });

    const precoCalculado = calcPrecoProduto(produtoDoc, meta);

    if (existeIdx !== -1) {
      user.itensCarrinho[existeIdx].quantidade = (user.itensCarrinho[existeIdx].quantidade || 0) + Number(quantidade);
      // actualiza o preço (útil se preços mudarem)
      user.itensCarrinho[existeIdx].preco = precoCalculado;
    } else {
      user.itensCarrinho.push({
        produto: produtoDoc._id,
        quantidade: Number(quantidade),
        preco: precoCalculado,
        meta: meta ?? undefined
      });
    }

    await user.save();

    // Recarregar e povoar para devolver ao cliente
    const populated = await User.findById(req.user._id).populate("itensCarrinho.produto", "nome imagem preco ingredientes").lean();
    const itens = (populated.itensCarrinho || []).map(buildClientItem).filter(Boolean);
    return res.json(itens);
  } catch (error) {
    console.error("Erro adicionarAoCarrinho:", error);
    return res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

export const removerItemDoCarrinho = async (req, res) => {
  try {
    const cartItemId = req.params.id; // id do subdoc
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.itensCarrinho = user.itensCarrinho.filter(it => String(it._id) !== String(cartItemId));
    await user.save();

    const populated = await User.findById(req.user._id).populate("itensCarrinho.produto", "nome imagem preco ingredientes").lean();
    const itens = (populated.itensCarrinho || []).map(buildClientItem).filter(Boolean);
    return res.json(itens);
  } catch (error) {
    console.error("Erro removerItemDoCarrinho:", error);
    return res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

export const limparCarrinho = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.itensCarrinho = [];
    await user.save();
    return res.json([]);
  } catch (error) {
    console.error("Erro limparCarrinho:", error);
    return res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

export const atualizarQuantidade = async (req, res) => {
  try {
    const cartItemId = req.params.id; // id do subdoc
    let { quantidade } = req.body;
    quantidade = Number(quantidade ?? 1);
    if (isNaN(quantidade) || quantidade < 0) return res.status(400).json({ msg: "Quantidade inválida" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const item = user.itensCarrinho.id(cartItemId);
    if (!item) return res.status(404).json({ msg: "Item nao encontrado" });

    if (quantidade === 0) {
      item.remove();
    } else {
      item.quantidade = quantidade;
    }

    await user.save();

    const populated = await User.findById(req.user._id).populate("itensCarrinho.produto", "nome imagem preco ingredientes").lean();
    const itens = (populated.itensCarrinho || []).map(buildClientItem).filter(Boolean);
    return res.json(itens);
  } catch (error) {
    console.error("Erro ao atualizar quantidade", error);
    return res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};
