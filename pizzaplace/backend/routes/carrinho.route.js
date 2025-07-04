import express from "express";
import { adicionarAoCarrinho, getProdutosCarrinho, removerTodosDoCarrinho, atualizarQuantidade } from "../controllers/carrinho.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getProdutosCarrinho);
router.post("/", protectRoute, adicionarAoCarrinho);
router.delete("/", protectRoute, removerTodosDoCarrinho);
router.put("/:id", protectRoute, atualizarQuantidade);

export default router