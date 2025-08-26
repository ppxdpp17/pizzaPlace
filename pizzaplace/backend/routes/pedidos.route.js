import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getTodosPedidos, getPedidosDoUtilizador, updatePedidoEstado } from "../controllers/pedido.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getTodosPedidos);
router.get("/me", protectRoute, getPedidosDoUtilizador);
router.patch("/:id/estado", protectRoute, updatePedidoEstado);


export default router;
