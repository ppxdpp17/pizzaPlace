import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getDadosAnalise, getDadosVendasDiarias } from "../controllers/analise.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, async (req,res) => {
    try {
        const dadosAnalise = await getDadosAnalise();

        const dataFim = new Date();
        const dataInicio = new Date(dataFim.getTime() - 7 * 24 * 60 * 60 * 1000); //7 dias antes da data atual

        const dadosVendasDiarias = await getDadosVendasDiarias(dataInicio, dataFim);

        res.json({
            dadosAnalise,
            dadosVendasDiarias
        })

    } catch (error) {
        console.log("Erro ao obter dados de analise", error.message);
        res.status(500).json({msg: "Erro no servidor", error: error.message});
    }
})

export default router