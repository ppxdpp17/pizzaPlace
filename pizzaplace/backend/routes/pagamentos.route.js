import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { criarSessaoCheckout, sucessoCheckout, cashPayment } from "../controllers/pagamento.controller.js";

const router = express.Router();

router.post("/criar-sessao-checkout", protectRoute, criarSessaoCheckout);
router.post("/sucesso-checkout", protectRoute, sucessoCheckout);
router.post("/dinheiro", protectRoute, cashPayment);

export default router