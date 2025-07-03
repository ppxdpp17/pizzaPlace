import Cupao from "../models/cupao.model.js";

export const getCupao = async (req, res) => {
    try {
        const cupao = await Cupao.findOne({userId: req.user._id, ativo: true});
        res.json(cupao || null);

    } catch (error) {
        console.log("Erro ao obter cupao", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}

export const validarCupao = async (req, res) => {
    try {
        const {codigo} = reqq.body;
        const cupao = await Cupao.findOne({codigo: codigo, userId: req.user._id, ativo: true});
    
        if(!cupao)
        {
            return res.status(404).json({msg: "Cupao nao encontrado."});
        }

        if(cupao.dataExpiracao < new Date())
        {
            cupao.ativo = false;
            await cupao.save();
            return res.status(404).json({msg: "Cupao expirado."});
        }

        res.json({
            message: "Cupao valido",
            codio: cupao.codigo,
            percentagemDesconto: cupao.percentagemDesconto
        })
    } catch (error) {
        console.log("Erro ao validar cupao", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
}