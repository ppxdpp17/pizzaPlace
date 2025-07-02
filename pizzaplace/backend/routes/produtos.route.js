import express from "express";
import { getAllProdutos, getProdutosDisponiveis, criarProduto, apagarProduto, getProdutosRecomendados, getProdutosPorCategoria, disponibilizarProduto } from "../controllers/produto.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProdutos);
router.get("/disponiveis", getProdutosDisponiveis);
router.get("/categoria/:categoria", getProdutosPorCategoria);
router.get("/recomendacoes", getProdutosRecomendados);
router.post("/", protectRoute, adminRoute, criarProduto);
router.patch("/:id", protectRoute, adminRoute, disponibilizarProduto);
router.delete("/:id", protectRoute, adminRoute, apagarProduto);

export default router