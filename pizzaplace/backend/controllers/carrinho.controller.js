import Produto from "../models/produto.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getProdutosCarrinho = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ msg: "User not found" });

    const itens = user.itensCarrinho || []; // [{ produto: ObjectId, quantidade }]

    if (itens.length === 0) return res.json([]);

    const ids = itens.map(i => i.produto);

    // Buscar produtos (apenas existentes) e popular ingredientes
    const produtos = await Produto.find({ _id: { $in: ids }, estaDisponivel: true })
      .populate("ingredientes", "nome icone")
      .lean();

    // Map de produtos por _id para fácil lookup
    const map = new Map(produtos.map(p => [String(p._id), p]));

    // Reconstruir itens com quantidade — mantém apenas os que existem e estão disponíveis
    const itensCarrinho = itens
      .map(i => {
        const prod = map.get(String(i.produto));
        if (!prod) return null;
        return { ...prod, quantidade: i.quantidade ?? 1 };
      })
      .filter(Boolean);

    // Se removemos itens (produtos indisponíveis), atualiza o user.itensCarrinho e persiste
    const removedCount = itens.length - itensCarrinho.length;
    if (removedCount > 0) {
      const novoItens = itensCarrinho.map(i => ({ produto: i._id, quantidade: i.quantidade }));
      await User.findByIdAndUpdate(req.user._id, { itensCarrinho: novoItens });
    }

    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const adicionarAoCarrinho = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ msg: "productId required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // procura por produto já no carrinho
    const existing = user.itensCarrinho.find(item => String(item.produto) === String(productId));
    if (existing) {
      existing.quantidade += 1;
    } else {
      user.itensCarrinho.push({ produto: productId, quantidade: 1 });
    }

    await user.save();

    // Retornar o cart atualizado (populado)
    // Reusar a lógica de getProdutosCarrinho: buscar produtos populados
    const itens = user.itensCarrinho;
    const ids = itens.map(i => i.produto);
    const produtos = await Produto.find({ _id: { $in: ids }, estaDisponivel: true })
      .populate("ingredientes", "nome icone")
      .lean();

    const map = new Map(produtos.map(p => [String(p._id), p]));
    const itensCarrinho = itens
      .map(i => {
        const prod = map.get(String(i.produto));
        if (!prod) return null;
        return { ...prod, quantidade: i.quantidade ?? 1 };
      })
      .filter(Boolean);

    // Se tiver objetos removidos (inexistentes ou indisponíveis), sincroniza o user
    if (itensCarrinho.length !== itens.length) {
      const novoItens = itensCarrinho.map(i => ({ produto: i._id, quantidade: i.quantidade }));
      user.itensCarrinho = novoItens;
      await user.save();
    }

    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Erro no controller de adicionarAoCarrinho", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removerTodosDoCarrinho = async (req, res) => {
  try {
    const { produtoID } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!produtoID) {
      user.itensCarrinho = [];
    } else {
      user.itensCarrinho = user.itensCarrinho.filter(item => String(item.produto) !== String(produtoID));
    }

    await user.save();

    // Retorna o cart (vazio ou atualizado)
    // Opcional: devolver o array populado; aqui devolvo o array simples:
    const ids = user.itensCarrinho.map(i => i.produto);
    const produtos = await Produto.find({ _id: { $in: ids }, estaDisponivel: true })
      .populate("ingredientes", "nome icone")
      .lean();

    const map = new Map(produtos.map(p => [String(p._id), p]));
    const itensCarrinho = user.itensCarrinho
      .map(i => {
        const prod = map.get(String(i.produto));
        if (!prod) return null;
        return { ...prod, quantidade: i.quantidade ?? 1 };
      })
      .filter(Boolean);

    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Erro ao remover do carrinho", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

export const atualizarQuantidade = async (req, res) => {
  try {
    const { id: produtoID } = req.params;
    const { quantidade } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const item = user.itensCarrinho.find(i => String(i.produto) === String(produtoID));

    if (!item) return res.status(404).json({ msg: "Item nao encontrado" });

    if (quantidade === 0) {
      user.itensCarrinho = user.itensCarrinho.filter(i => String(i.produto) !== String(produtoID));
      await user.save();
    } else {
      item.quantidade = quantidade;
      await user.save();
    }

    // Retornar cart atualizado (populate)
    const ids = user.itensCarrinho.map(i => i.produto);
    const produtos = await Produto.find({ _id: { $in: ids }, estaDisponivel: true })
      .populate("ingredientes", "nome icone")
      .lean();

    const map = new Map(produtos.map(p => [String(p._id), p]));
    const itensCarrinho = user.itensCarrinho
      .map(i => {
        const prod = map.get(String(i.produto));
        if (!prod) return null;
        return { ...prod, quantidade: i.quantidade ?? 1 };
      })
      .filter(Boolean);

    // Persistir se removemos itens indisponíveis
    if (itensCarrinho.length !== user.itensCarrinho.length) {
      const novoItens = itensCarrinho.map(i => ({ produto: i._id, quantidade: i.quantidade }));
      user.itensCarrinho = novoItens;
      await user.save();
    }

    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Erro ao atualizar quantidade", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};