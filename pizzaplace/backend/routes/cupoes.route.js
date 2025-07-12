import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCupao, validarCupao } from "../controllers/cupao.controller.js";

const router = express.Router();

router.get("/", protectRoute, getCupao);
router.post("/validar", protectRoute, validarCupao);

export default router