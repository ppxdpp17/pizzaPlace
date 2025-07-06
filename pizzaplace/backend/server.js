//Packages
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

//Rotas
import authRoutes from "./routes/auth.route.js";
import produtosRoutes from "./routes/produtos.route.js";
import carrinhoRoutes from "./routes/carrinho.route.js";
import cupoesRoutes from "./routes/cupoes.route.js";
import pagamentosRoutes from "./routes/pagamentos.route.js";
import analisesRoutes from "./routes/analises.route.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(express.json({limit: "50mb"}));
app.use(cookieParser());

app.use("/api/auth", authRoutes)    //Rotas de autenticação 
app.use("/api/produtos", produtosRoutes)    //Rotas de produtos 
app.use("/api/carrinho", carrinhoRoutes)    //Rotas do carrinho 
app.use("/api/cupoes", cupoesRoutes)    //Rotas do carrinho 
app.use("/api/pagamentos", pagamentosRoutes)    //Rotas do carrinho 
app.use("/api/analises", analisesRoutes)    //Rotas do carrinho 

app.listen(PORT, () => {
    console.log("Servidor a correr na porta http://localhost:" + PORT)

    connectDB();
})