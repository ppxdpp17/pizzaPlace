import express from "express";
import { adicionarAoCarrinho, getProdutosCarrinho, limparCarrinho, removerItemDoCarrinho, atualizarQuantidade }
from "../controllers/carrinho.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getProdutosCarrinho);
router.post("/", protectRoute, adicionarAoCarrinho);

// remover item específico
router.delete("/:id", protectRoute, removerItemDoCarrinho);

// limpar carrinho completo
router.delete("/", protectRoute, limparCarrinho);

// atualizar quantidade por cartItemId (subdoc _id)
router.put("/:id", protectRoute, atualizarQuantidade);

export default router;
