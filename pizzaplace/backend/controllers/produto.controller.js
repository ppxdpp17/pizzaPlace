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