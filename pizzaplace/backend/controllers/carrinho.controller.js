import Produto from "../models/produto.model.js";

export const getProdutosCarrinho = async (req, res) => {
    try {
        const produtos = await Produto.find({_id:{$in: req.user.itensCarrinho}});

        //Adicionar quantidade para cada produto
        const itensCarrinho = produtos.map(produto => {
            const item = req.user.itensCarrinho.find(item => item.id === produto._id);
            return {...produto.toJSON(), quantidade: item.quantidade};
        })

        res.json(itensCarrinho);
    } catch (error) {
        console.log("Erro ao obter produtos do carrinho", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}

export const adicionarAoCarrinho = async (req, res) => {
    try {
        const {produtoID} = req.body;
        const user = req.user;

        const itemExiste = user.itensCarrinho.find(item => item.id === produtoID);
        if(itemExiste)
        {
            itemExiste.quantidade += 1;
        }
        else
        {
            user.itensCarrinho.push(produtoID);
        }

        await user.save();
        
        res.json(user.itensCarrinho);
    } catch (error) {
        console.log("Erro ao adicionar ao carrinho", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
};

export const removerTodosDoCarrinho = async (req, res) => {
    try {
        const {produtoID} = req.body;
        const user = req.user;

        if(!produtoID)
        {
            user.itensCarrinho = [];
        }
        else
        {
            user.itensCarrinho = user.itensCarrinho.filter((item) => item.id !== produtoID);
        }

        await user.save();
        
        res.json(user.itensCarrinho);
    } catch (error) {
        console.log("Erro ao remover do carrinho", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
};

export const atualizarQuantidade = async (req, res) => {
    try {
        const {id: produtoID} = req.params;
        const {quantidade} = req.body;
        const user = req.user;

        const itemExiste = user.itensCarrinho.find((item) => item.id === produtoID);
        
        if(itemExiste)
        {
            if(quantidade === 0)
            {
                user.itensCarrinho = user.itensCarrinho.filter((item) => item.id !== produtoID);
                await user.save();
                return res.json(user.itensCarrinho);
            }

            itemExiste.quantidade = quantidade;
            await user.save();
            res.json(user.itensCarrinho);
        }
        else
        {
            res.status(404).json({msg: "Item nao encontrado"});
        }
    } catch (error) {
        console.log("Erro ao atualizar quantidade", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}