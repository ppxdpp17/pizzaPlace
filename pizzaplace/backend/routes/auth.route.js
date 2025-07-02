import express from "express";
import { login, logout, signup, tokenRefresh } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", tokenRefresh);
//router.get("/perfil", getPerfil);

export default router