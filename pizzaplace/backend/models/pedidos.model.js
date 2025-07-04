import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "O id do user é obrigatório."],
    },
    produtos: [
        {
            produto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Produto",
                required: [true, "O produto é obrigatório."],
            },
            quantidade: {
                type: Number,
                required: [true, "A quantidade é obrigatória."],
                min: 1
            },
            preco: {
                type: Number,
                required: [true, "O preco é obrigatório."],
                min: 0
            }
        }
    ],
    total: {
        type: Number,
        required: [true, "O total é obrigatório."],
        min: 0
    },
    stripeSessionID: {
        type: String,
        unique: true,
    }
    },
    { timestamps: true }
);

const Pedido = mongoose.model("Pedido", pedidoSchema);