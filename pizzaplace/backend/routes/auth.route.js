import express from "express";
import { login, logout, signup, tokenRefresh, getPerfil } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", tokenRefresh);
router.get("/perfil", protectRoute, getPerfil);

export default router