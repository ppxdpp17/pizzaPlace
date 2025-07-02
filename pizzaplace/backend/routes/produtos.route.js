import express from "express";
import { getAllProdutos, getProdutosDisponiveis } from "../controllers/produto.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProdutos);
router.get("/disponiveis", getProdutosDisponiveis);
router.post("/", protectRoute, adminRoute, criarProduto);

export default router