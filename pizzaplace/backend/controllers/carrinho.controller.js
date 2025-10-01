import Produto from "../models/produto.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const PRICE_MULTIPLIERS = {
  pequena: 1.0,
  media: 1.2,
  grande: 1.4
};

// Util: calcula preço final dado produtoDoc e meta
async function calcularPrecoServidor(produtoId, meta = {}) {
  // produtoId é ObjectId/string válida
  const produtoDoc = await Produto.findById(produtoId).lean();
  if (!produtoDoc) throw new Error("Produto não existe");

  let precoBase = Number(produtoDoc.preco ?? 0);

  // Caso especial: meta.tipo === 'mix-2' -> espera meta.pizzaA e meta.pizzaB
  if (meta && meta.tipo === "mix-2") {
    // buscar os dois produtos
    const pA = await Produto.findById(meta.pizzaA).lean();
    const pB = await Produto.findById(meta.pizzaB).lean();
    if (!pA || !pB) throw new Error("Uma das pizzas do mix não existe");
    const precoA = Number(pA.preco ?? 0);
    const precoB = Number(pB.preco ?? 0);
    const soma = precoA + precoB;
    const mult = PRICE_MULTIPLIERS[meta.tamanho] ?? 1.0;
    return Number((soma * mult).toFixed(2));
  }

  // Caso normal: aplicar multiplicador por tamanho se houver
  if (meta && meta.tamanho) {
    const mult = PRICE_MULTIPLIERS[meta.tamanho] ?? 1.0;
    return Number((precoBase * mult).toFixed(2));
  }

  return Number(precoBase);
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

    // Mantém os ids como strings (apenas os válidos)
    const ids = itens
      .map(i => i.produto)
      .filter(id => mongoose.Types.ObjectId.isValid(String(id)))
      .map(id => String(id));

    // Query aceita strings — Mongoose faz o cast
    const produtos = await Produto.find({ _id: { $in: ids }, estaDisponivel: true })
      .populate("ingredientes", "nome icone")
      .lean();

    const map = new Map(produtos.map(p => [String(p._id), p]));

    const itensCarrinho = itens
      .map(i => {
        const prod = map.get(String(i.produto));
        if (!prod) return null;
        return {
          ...prod,
          quantidade: i.quantidade ?? 1,
          meta: i.meta ?? undefined,
          preco: i.preco ?? Number(prod.preco ?? 0)
        };
      })
      .filter(Boolean);

    // Se removemos itens (produtos indisponíveis), atualiza o user.itensCarrinho
    if (itensCarrinho.length !== itens.length) {
      const novoItens = itensCarrinho.map(i => ({ produto: i._id, quantidade: i.quantidade, preco: i.preco, meta: i.meta }));
      await User.findByIdAndUpdate(req.user._id, { itensCarrinho: novoItens });
    }

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

    // calcular preço final no servidor (garante integridade)
    const precoUnit = await calcularPrecoServidor(productId, meta);

    // identificar se já existe item com mesmo produto e mesma meta (comparar por tamanho / tipo)
    const equalsMeta = (a, b) => {
      // comparação simples: se ambos undefined -> equal
      if (!a && !b) return true;
      try {
        return JSON.stringify(a ?? {}) === JSON.stringify(b ?? {});
      } catch {
        return false;
      }
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
      // actualizar preco se quiseres (ou deixar o preco guardado)
      found.preco = precoUnit;
    } else {
      user.itensCarrinho.push({
        produto: String(productId), // Mongoose irá converter ao salvar
        quantidade: Number(quantidade),
        preco: precoUnit,
        meta: meta ?? undefined
      });
    }

    await user.save();

    // retornar cart populado (reusar getProdutosCarrinho logic)
    // Nota: podemos chamar a função acima ou repetir o fetch
    const updatedUser = await User.findById(req.user._id).lean();
    const itens = updatedUser.itensCarrinho || [];
    const ids = itens.map(i => i.produto).filter(id => mongoose.Types.ObjectId.isValid(String(id)));
    const produtos = await Produto.find({ _id: { $in: ids }, estaDisponivel: true }).populate("ingredientes", "nome icone").lean();
    const map = new Map(produtos.map(p => [String(p._id), p]));
    const itensCarrinho = itens.map(i => {
      const prod = map.get(String(i.produto)); if (!prod) return null;
      return { ...prod, quantidade: i.quantidade ?? 1, meta: i.meta ?? undefined, preco: i.preco ?? Number(prod.preco ?? 0) };
    }).filter(Boolean);

    // sincronizar caso itens removidos
    if (itensCarrinho.length !== itens.length) {
      const novoItens = itensCarrinho.map(i => ({ produto: i._id, quantidade: i.quantidade, preco: i.preco, meta: i.meta }));
      await User.findByIdAndUpdate(req.user._id, { itensCarrinho: novoItens });
    }

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
      // sem produtoID -> limpar tudo
      user.itensCarrinho = [];
    } else {
      // se foi passado um id, valida antes de filtrar
      if (!mongoose.Types.ObjectId.isValid(String(produtoID))) {
        return res.status(400).json({ msg: "produtoID inválido" });
      }

      user.itensCarrinho = user.itensCarrinho.filter(item => String(item.produto) !== String(produtoID));
    }

    await user.save();

    // devolver cart atualizado (populado)
    const updatedUser = await User.findById(req.user._id).lean();
    const itens = updatedUser.itensCarrinho || [];

    const ids = itens
      .map(i => i.produto)
      .filter(id => mongoose.Types.ObjectId.isValid(String(id)));

    const produtos = await Produto.find({ _id: { $in: ids }, estaDisponivel: true })
      .populate("ingredientes", "nome icone")
      .lean();

    const map = new Map(produtos.map(p => [String(p._id), p]));
    const itensCarrinho = itens.map(i => {
      const prod = map.get(String(i.produto));
      if (!prod) return null;
      return {
        ...prod,
        quantidade: i.quantidade ?? 1,
        meta: i.meta ?? undefined,
        preco: i.preco ?? Number(prod.preco ?? 0)
      };
    }).filter(Boolean);

    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Erro ao remover do carrinho", error.message || error);
    res.status(500).json({ msg: "Erro no servidor", error: error.message ?? String(error) });
  }
};

/**
 * PUT /carrinho/:id => atualizar quantidade para o produto id (id = produto._id)
 * corpo { quantidade }
 */
export const atualizarQuantidade = async (req, res) => {
  try {
    const { id: produtoID } = req.params;
    const { quantidade } = req.body;

    if (!mongoose.Types.ObjectId.isValid(String(produtoID))) return res.status(400).json({ msg: "ID inválido" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const item = user.itensCarrinho.find(i => String(i.produto) === String(produtoID));
    if (!item) return res.status(404).json({ msg: "Item nao encontrado" });

    if (Number(quantidade) <= 0) {
      user.itensCarrinho = user.itensCarrinho.filter(i => String(i.produto) !== String(produtoID));
    } else {
      item.quantidade = Number(quantidade);
    }

    await user.save();

    // devolver cart atualizado (populado)
    const updatedUser = await User.findById(req.user._id).lean();
    const itens = updatedUser.itensCarrinho || [];
    const ids = itens.map(i => i.produto).filter(id => mongoose.Types.ObjectId.isValid(String(id)));
    const produtos = await Produto.find({ _id: { $in: ids }, estaDisponivel: true }).populate("ingredientes", "nome icone").lean();
    const map = new Map(produtos.map(p => [String(p._id), p]));
    const itensCarrinho = itens.map(i => {
      const prod = map.get(String(i.produto)); if (!prod) return null;
      return { ...prod, quantidade: i.quantidade ?? 1, meta: i.meta ?? undefined, preco: i.preco ?? Number(prod.preco ?? 0) };
    }).filter(Boolean);

    // sincronizar caso removidos
    if (itensCarrinho.length !== itens.length) {
      const novoItens = itensCarrinho.map(i => ({ produto: i._id, quantidade: i.quantidade, preco: i.preco, meta: i.meta }));
      await User.findByIdAndUpdate(req.user._id, { itensCarrinho: novoItens });
    }

    return res.json(itensCarrinho);
  } catch (error) {
    console.log("Erro ao atualizar quantidade", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};
