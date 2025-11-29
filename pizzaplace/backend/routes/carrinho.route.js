import express from "express";
import { adicionarAoCarrinho, getProdutosCarrinho, removerTodosDoCarrinho, atualizarQuantidade, validateCart } from "../controllers/carrinho.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getProdutosCarrinho);
router.get("/validate", protectRoute, validateCart);
router.post("/", protectRoute, adicionarAoCarrinho);
router.delete("/", protectRoute, removerTodosDoCarrinho);       // limpa ou body.produtoID
router.delete("/:id", protectRoute, removerTodosDoCarrinho);    // remove by param
router.put("/:id", protectRoute, atualizarQuantidade);

export default router;
