import express from "express";
import { getAllProdutos } from "../controllers/produto.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProdutos);

export default router