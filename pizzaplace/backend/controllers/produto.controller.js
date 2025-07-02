import { redis } from "../lib/redis.js";
import Produto  from "../models/produto.model.js";

export const getAllProdutos = async (req, res) => {
    try {
        //Get todos os produtos
        const produtos = await Produto.find();
        res.json({produtos});
    } catch (error) {
        console.log("Erro no controller de produtos", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
};

export const getProdutosDisponiveis = async (req, res) => {
    try {
        let produtosDisponiveis = await redis.get("produtos_disponiveis");
        if(produtosDisponiveis)
        {
            return res.json(JSON.parse(produtosDisponiveis));
        }

        //Se não estiver no redis, vamos buscar ao mongodb
        produtosDisponiveis = await Produto.find({disponivel: true}).lean();    //.lean() vai retornar um objeto javascript
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