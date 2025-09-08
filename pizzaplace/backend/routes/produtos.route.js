import express from "express";
import { getAllProdutos, getProdutosDisponiveis, criarProduto, apagarProduto, getProdutosRecomendados, getProdutosPorCategoria, disponibilizarProduto, getProdutoById, atualizarProduto} from "../controllers/produto.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProdutos);
router.get("/disponiveis", getProdutosDisponiveis);
router.get("/categoria/:categoria", getProdutosPorCategoria);
router.get("/recomendacoes", getProdutosRecomendados);
router.get("/:id", getProdutoById);
router.post("/", protectRoute, adminRoute, criarProduto);
router.put("/:id", protectRoute, adminRoute, atualizarProduto);
router.patch("/:id", protectRoute, adminRoute, disponibilizarProduto);
router.delete("/:id", protectRoute, adminRoute, apagarProduto);

export default router;
