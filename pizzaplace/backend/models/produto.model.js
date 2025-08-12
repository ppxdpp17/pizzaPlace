import mongoose, { mongo } from "mongoose";

const produtoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, "O nome é obrigatório."],
    },
    descricao: {
        type: String,
        required: [true, "A descricao é obrigatória."],
    },
    preco: {
        type: Number,
        min: 0,
        required: [true, "O preço é obrigatório."],
    },
    imagem: {
        type: String,
        required: [true, "A imagem é obrigatória."],
    },
    categoria: {
        type: String,
        required: [true, "A categoria é obrigatória."],
    },
    estaDisponivel: {
        type: Boolean,
        default: false
    },
    estado: {
        type: String,
        required: [true, "O estado é obrigatório."],
        enum: ["A Cozinhar", "A Caminho", "Entregue"],
        default: "A Cozinhar"
    }
},
{
    timestamps: true
});

const Produto = mongoose.model("Produto", produtoSchema);

export default Produto;