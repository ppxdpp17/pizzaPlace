import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getTodosPedidos } from "../controllers/pedido.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getTodosPedidos);

export default router;
