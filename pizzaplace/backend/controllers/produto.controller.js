import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Produto from "../models/produto.model.js";


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

//Obter até 6 produtos recomendados de forma aleatória (usando aggregate + lookup para populate)
export const getProdutosRecomendados = async (req, res) => {
  try {
    let produtos = await Produto.aggregate([
      { $match: { estaDisponivel: true } },
      { $sample: { size: 6 } },
      { $project: { _id: 1, nome: 1, preco: 1, imagem: 1, categoria: 1, ingredientes: 1 } }
    ]);

    const anyNeedPopulate = produtos.some(p => p.ingredientes && p.ingredientes.length > 0 && typeof p.ingredientes[0] !== "object");

    if (anyNeedPopulate) {
      const allIds = produtos.flatMap(p => (p.ingredientes || []).filter(Boolean));
      const uniqueIds = Array.from(new Set(allIds.map(String))).filter(id => id);

      const ingredientesDocs = await Ingrediente.find({ _id: { $in: uniqueIds } }).lean();
      const map = new Map(ingredientesDocs.map(i => [String(i._id), i]));

      produtos = produtos.map(p => {
        if (!p.ingredientes || p.ingredientes.length === 0) return p;
        if (typeof p.ingredientes[0] === "object") return p;

        const ordenadas = p.ingredientes.map(id => map.get(String(id))).filter(Boolean);
        return { ...p, ingredientes: ordenadas };
      });
    }

    return res.json(produtos);
  } catch (error) {
    console.log("Erro no controller de produtos", error.message);
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
