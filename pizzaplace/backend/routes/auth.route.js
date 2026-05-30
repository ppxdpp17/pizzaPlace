import express from "express";
import rateLimit from "express-rate-limit";
import { login, logout, signup, tokenRefresh, getPerfil, verificarEmail, esqueceuPassword, reporPassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

const loginLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		return res.status(429).json({ error: "Demasiadas tentativas no login. Tente novamente daqui a 10 minutos." });
	}
});

router.post("/signup", signup);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/refresh-token", tokenRefresh);
router.get("/perfil", protectRoute, getPerfil);
router.post("/verificar-email", verificarEmail);
router.post("/esqueceu-password", esqueceuPassword)
router.post("/reset-password/:token", reporPassword)

export default router