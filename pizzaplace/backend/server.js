//Packages
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import mongoSanitize from 'express-mongo-sanitize';

//import { startPedidoStatusJob } from "./jobs/pedidoStatus.job.js";

//Rotas
import authRoutes from "./routes/auth.route.js";
import produtosRoutes from "./routes/produtos.route.js";
import carrinhoRoutes from "./routes/carrinho.route.js";
import cupoesRoutes from "./routes/cupoes.route.js";
import pagamentosRoutes from "./routes/pagamentos.route.js";
import analisesRoutes from "./routes/analises.route.js";
import pedidosRoutes from "./routes/pedidos.route.js";
import ingredienteRoutes from "./routes/ingrediente.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ___dirname = path.resolve();

app.use(cors({
    origin: ["http://localhost:5173", "http://192.168.1.179:5173"],
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

app.use("/api/auth", authRoutes)    //Rotas de autenticação 
app.use("/api/produtos", produtosRoutes)    //Rotas de produtos 
app.use("/api/carrinho", carrinhoRoutes)    //Rotas do carrinho 
app.use("/api/cupoes", cupoesRoutes)    //Rotas do carrinho 
app.use("/api/pagamentos", pagamentosRoutes)    //Rotas do carrinho 
app.use("/api/analises", analisesRoutes)    //Rotas do carrinho 
app.use("/api/pedidos", pedidosRoutes)    //Rotas dos pedidos
app.use("/api/ingredientes", ingredienteRoutes)  //Rota dos ingredientes

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(___dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(___dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log("Servidor a correr na porta http://localhost:" + PORT)

    connectDB();
})

//startPedidoStatusJob(); - para mudar o estado do pedido passado x minutos