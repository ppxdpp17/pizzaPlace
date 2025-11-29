import { connectDB } from "./lib/db.js";
import Produto from "./models/produto.model.js";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
    try {
        await connectDB();
        const name = "Pizza Costumizada";
        let p = await Produto.findOne({ nome: name });
        if (!p) {
            p = await Produto.create({
                nome: name,
                descricao: "Pizza ao seu gosto",
                preco: 6.0,
                imagem: "/makeYourOwn.png",
                categoria: "pizzas",
                estaDisponivel: true
            });
            console.log("CREATED_ID:" + p._id);
        } else {
            console.log("FOUND_ID:" + p._id);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
};

run();
