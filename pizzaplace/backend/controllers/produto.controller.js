import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Produto from "../models/produto.model.js";
import Ingrediente from "../models/ingrediente.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

//Obter todos os produtos
export const getAllProdutos = async (req, res) => {
  try {
    const produtos = await Produto.find({})
      .populate("ingredientes", "nome icone")
      .exec();
    res.json({ produtos });
  } catch (error) {
    console.log("Erro no controller de produtos", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

//Obter 1 produto
export const getProdutoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID inválido" });

    const produto = await Produto.findById(id).populate("ingredientes", "nome icone");
    if (!produto) return res.status(404).json({ msg: "Produto não encontrado." });

    return res.json(produto);
  } catch (error) {
    console.error("Erro getProdutoById:", error.message);
    return res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

//Obter apenas produtos que estão definidos como "disponível"
export const getProdutosDisponiveis = async (req, res) => {
  try {
    let produtosDisponiveis = await redis.get("produtos_disponiveis");
    if (produtosDisponiveis) {
      return res.json(JSON.parse(produtosDisponiveis));
    }

    //Retrieve e populate os ingredientes
    produtosDisponiveis = await Produto.find({ estaDisponivel: true })
      .populate("ingredientes", "nome icone")
      .lean();

    if (!produtosDisponiveis) {
      return res.status(404).json({ msg: "Nenhum produto disponível." });
    }

    //Guardar no redis
    await redis.set("produtos_disponiveis", JSON.stringify(produtosDisponiveis));

    res.json(produtosDisponiveis);
  } catch (error) {
    console.log("Erro no controller de produtos", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

//Criar um produto
export const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, imagem, categoria, ingredientes } = req.body;

    const ingredientesIds = Array.isArray(ingredientes)
      ? ingredientes.map((i) => {
          if (typeof i === "string") return i;
          if (i && (i._id || i.id)) return i._id ?? i.id;
          return null;
        }).filter(Boolean)
      : [];

    let respostaCloudinary = null;
    if (imagem) {
      respostaCloudinary = await cloudinary.uploader.upload(imagem, { folder: "produtos" });
    }

    const produto = await Produto.create({
      nome,
      descricao,
      preco,
      imagem: respostaCloudinary?.secure_url ?? "",
      categoria,
      ingredientes: ingredientesIds,
    });

    //Populate antes de devolver
    await produto.populate("ingredientes", "nome icone");

    res.status(201).json(produto);
  } catch (error) {
    console.log("Erro na criação de produto", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

//Apagar um produto
export const apagarProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto) {
      return res.status(404).json({ msg: "Produto não encontrado." });
    }

    //Apagar imagem do Cloudinary se existir
    if (produto.imagem) {
      try {
        //Extrair public id a partir da URL
        const parts = produto.imagem.split("/");
        const last = parts[parts.length - 1];
        const publicId = last.includes(".") ? last.substring(0, last.lastIndexOf(".")) : last;

        await cloudinary.uploader.destroy(`produtos/${publicId}`, { resource_type: "image" });
        console.log("Imagem apagada do Cloudinary:", publicId);
      } catch (err) {
        console.warn("Falha ao apagar imagem do Cloudinary (prosseguir):", err.message);
      }
    }

    //Apagar o produto do MongoDB
    await Produto.findByIdAndDelete(produto._id);

    //Limpar cache dos produtos disponíveis
    try {
      await redis.del("produtos_disponiveis");
    } catch (err) {
      console.warn("Falha ao limpar cache Redis (produtos_disponiveis):", err.message);
    }

    return res.json({ msg: "Produto apagado com sucesso." });
  } catch (error) {
    console.error("Erro ao apagar produto", error);
    return res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

//Receber 6 produtos recomendados (aleatórios)
export const getProdutosRecomendados = async (req, res) => {
  try {
    const size = Math.min(Math.max(parseInt(req.query.size || "6", 10), 1), 20); //Default 6, cap 20
    const excludeIds = (req.query.excludeIds || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const match = { estaDisponivel: true };
    if (excludeIds.length > 0) {
      match._id = { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    const pipeline = [
      { $match: match },
      { $sample: { size } },
      //Lookup para ingredients
      {
        $lookup: {
          from: "ingredientes",
          localField: "ingredientes",
          foreignField: "_id",
          as: "ingredientes"
        }
      },
      {
        $project: {
          nome: 1,
          preco: 1,
          imagem: 1,
          categoria: 1,
          estaDisponivel: 1,
          ingredientes: { nome: 1, icone: 1 }
        }
      }
    ];

    const produtos = await Produto.aggregate(pipeline);
    return res.json(produtos); //Devolve array
  } catch (error) {
    console.log("Erro no controller de produtos (recomendados)", error.message);
    return res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

//Filtrar produtos por categoria
export const getProdutosPorCategoria = async (req, res) => {
  const { categoria } = req.params;
  try {
    //Só produtos disponíveis
    const produtos = await Produto.find({ categoria, estaDisponivel: true }).populate("ingredientes");
    res.json({ produtos });
  } catch (error) {
    console.log("Erro no controller de produtos", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
}

//Disponibilizar produto
export const disponibilizarProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);
    if (produto) {
      produto.estaDisponivel = !produto.estaDisponivel;
      const produtoAtualizado = await produto.save();
      if (produtoAtualizado.estaDisponivel === false) {
        try {
          await User.updateMany(
            {},
            { $pull: { itensCarrinho: { produto: produtoAtualizado._id } } }
          );
        } catch (err) {
          console.warn("Falha ao remover produto de carrinhos persistidos:", err.message);
        }
      }
      await atualizarCacheProdutosDisponiveis();
      res.json(produtoAtualizado);
    } else {
      res.status(404).json({ msg: "Produto não encontrado." });
    }
  } catch (error) {
    console.log("Erro ao disponibilizar produto", error.message);
    res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};

//Função para atualizar produto
export const atualizarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ msg: "ID inválido" });

    const { nome, descricao, preco, imagem, categoria, ingredientes } = req.body;

    const produto = await Produto.findById(id);
    if (!produto) return res.status(404).json({ msg: "Produto não encontrado." });

    //Atualizar campos simples
    if (nome !== undefined) produto.nome = nome;
    if (descricao !== undefined) produto.descricao = descricao;
    if (preco !== undefined) produto.preco = preco;
    if (categoria !== undefined) produto.categoria = categoria;

    //Processar ingredientes: aceitar array de ids ou array de objects
    if (ingredientes !== undefined) {
      const ingredientesIds = Array.isArray(ingredientes)
        ? ingredientes.map(i => (typeof i === "string" ? i : (i._id ?? i.id ?? null))).filter(Boolean)
        : [];
      produto.ingredientes = ingredientesIds;
    }

    //Se a imagem recebida for diferente da atual (novo path),
    //faz upload para Cloudinary e apaga a anterior.
    if (imagem !== undefined && imagem !== produto.imagem) {
      //Apagar imagem antiga
      if (produto.imagem) {
        try {
          const parts = produto.imagem.split("/");
          const last = parts[parts.length - 1];
          const publicId = last.includes(".") ? last.substring(0, last.lastIndexOf(".")) : last;
          await cloudinary.uploader.destroy(`produtos/${publicId}`, { resource_type: "image" });
        } catch (err) {
          console.warn("Falha ao apagar imagem antiga do Cloudinary (prosseguir):", err.message);
        }
      }

      //Se imagem for dataURL/base64 ou uma URL remota
      try {
        const resposta = await cloudinary.uploader.upload(imagem, { folder: "produtos" });
        produto.imagem = resposta.secure_url;
      } catch (err) {
        console.warn("Upload imagem Cloudinary falhou (mantém imagem antiga):", err.message);
      }
    }

    const atualizado = await produto.save();
    await atualizado.populate("ingredientes", "nome icone");

    //Invalidar cache de produtos disponíveis
    try {
      if (redis) await redis.del("produtos_disponiveis");
      await atualizarCacheProdutosDisponiveis();
    } catch (err) {
      console.warn("Falha ao atualizar cache após update:", err?.message || err);
    }

    return res.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error.message);
    return res.status(500).json({ msg: "Erro no servidor", error: error.message });
  }
};


async function atualizarCacheProdutosDisponiveis() {
  try {
    const produtosDisponiveis = await Produto.find({ estaDisponivel: true })
      .populate("ingredientes", "nome icone")
      .lean();
    await redis.set("produtos_disponiveis", JSON.stringify(produtosDisponiveis));
  } catch (error) {
    console.log("Erro ao atualizar cache de produtos disponíveis", error.message);
  }
}
