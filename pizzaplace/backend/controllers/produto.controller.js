import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Produto  from "../models/produto.model.js";

//Obter todos os produtos
export const getAllProdutos = async (req, res) => {
    try {
        //Get todos os produtos
        const produtos = await Produto.find({});
        res.json({produtos});
    } catch (error) {
        console.log("Erro no controller de produtos", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
};

//Obter apenas produtos que estão definidos como "disponível"
export const getProdutosDisponiveis = async (req, res) => {
    try {
        let produtosDisponiveis = await redis.get("produtos_disponiveis");
        if(produtosDisponiveis)
        {
            return res.json(JSON.parse(produtosDisponiveis));
        }

        //Se não estiver no redis, vamos buscar ao mongodb
        produtosDisponiveis = await Produto.find({estaDisponivel: true}).lean();    //.lean() vai retornar um objeto javascript
        if(!produtosDisponiveis)                                                //em vez de um documento mongodb, o que é 
                                                                                //melhor para performance
        {
            return res.status(404).json({msg: "Nenhum produto disponível."});
        }

        //Guardar no redis para futuro acesso rápido
        await redis.set("produtos_disponiveis", JSON.stringify(produtosDisponiveis));

        res.json(produtosDisponiveis);
    } catch (error) {
        console.log("Erro no controller de produtos", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}

//Criar um produto
export const criarProduto = async (req, res) => {
    try {
        const {nome, descricao, preco, imagem, categoria} = req.body;

        let respostaCloudinary = null;

        if(imagem)
        {
            respostaCloudinary = await cloudinary.uploader.upload(imagem,{folder: "produtos"});
        }

        const produto = await Produto.create({
            nome, 
            descricao, 
            preco,
            imagem: respostaCloudinary?.secure_url ? respostaCloudinary.secure_url : "", 
            categoria
        });

        res.status(201).json(produto);
    } catch (error) {
        console.log("Erro na criação de produto", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}

//Apagar um produto
export const apagarProduto = async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);

        if(!produto)
        {
            return res.status(404).json({msg: "Produto não encontrado."});
        }

        if(produto.imagem)
        {
            const idPublico = produto.imagem.split("/").pop().split(".")[0];    //Vai buscar o id da imagem associada
            try {                                                               //ao produto a ser apagado para a apagar também
                await cloudinary.uploader.destroy(`produtos/${idPublico}`);                  
                console.log("Imagem apagada do cloudinary");
            } catch (error) {
                console.log("Erro ao apagar imagem do cloudinary", error.message);
            }
        }
        await Produto.findByIdAndDelete(req.params.id);
        res.json({msg: "Produto apagado com sucesso."});
    } catch (error) {
        console.log("Erro ao apagar produto", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    } 
}

//Obter 3 produtos recomendados
export const getProdutosRecomendados = async (req, res) => {
    try {
        const produtos = await Produto.aggregate([
            {
                $sample: {size: 3 }
            },
            {
                $project:{
                    _id: 1,
                    nome: 1,
                    preco: 1,
                    imagem: 1,
                    descricao: 1
                }
            }
        ])

        res.json(produtos);
    } catch (error) {
        console.log("Erro no controller de produtos", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}

//Filtrar produtos por categoria
export const getProdutosPorCategoria = async (req, res) => {
    const {categoria} = req.params;
    try {
        const produtos = await Produto.find({categoria});
        res.json(produtos);
    } catch (error) {
        console.log("Erro no controller de produtos", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}

//Tornar produto disponível
export const disponibilizarProduto = async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);
        if(produto)
        {
            produto.estaDisponivel = !produto.estaDisponivel;
            const produtoAtualizado = await produto.save();
            await atualizarCacheProdutosDisponiveis();
            res.json(produtoAtualizado);
        } else {
            res.status(404).json({msg: "Produto não encontrado."});
        }
    } catch (error) {
        console.log("Erro ao disponibilizar produto", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}

//Atualizar a cache dos produtos disponíveis
async function atualizarCacheProdutosDisponiveis() {
    try {
        const produtosDisponiveis = await Produto.find({estaDisponivel: true}).lean();
        await redis.set("produtos_disponiveis", JSON.stringify(produtosDisponiveis));
    } catch (error) {
        console.log("Erro ao atualizar cache de produtos disponíveis", error.message);
    }
}