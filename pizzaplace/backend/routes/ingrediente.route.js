import express from "express";
import { getTodosIngredientes, criarIngrediente } from "../controllers/ingredientes.controller.js";
const router = express.Router();

router.get("/", getTodosIngredientes);
router.post("/", criarIngrediente);

export default router;
