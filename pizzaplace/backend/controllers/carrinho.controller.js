import Produto from "../models/produto.model.js";

export const getProdutosCarrinho = async (req, res) => {
    try {
		const produtos = await Produto.find({ _id: { $in: req.user.itensCarrinho } });

		//Adicionar quantidade para cada produto
		const itensCarrinho = produtos.map((produto) => {
			const item = req.user.itensCarrinho.find((itemCarrinho) => itemCarrinho.id === produto.id);
			return { ...produto.toJSON(), quantidade: item.quantidade };
		});

		res.json(itensCarrinho);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
}

export const adicionarAoCarrinho = async (req, res) => {
    try {
		const { productId } = req.body;
		const user = req.user;

		const existingItem = user.itensCarrinho.find((item) => item.id === productId);
		if (existingItem) {
			existingItem.quantidade += 1;
		} else {
			user.itensCarrinho.push(productId);
		}

		await user.save();
		res.json(user.itensCarrinho);
	} catch (error) {
		console.log("Erro no controller de adicionarAoCarrinho", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
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