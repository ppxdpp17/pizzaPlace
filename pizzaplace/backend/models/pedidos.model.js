import mongoose from "mongoose";

//Incluir a morada
const addressSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  line1:       { type: String, required: true },
  line2:       { type: String },
  city:        { type: String, required: true },
  postal_code: { type: String, required: true },
  country:     { type: String, required: true }
}, { _id: false });


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
    },
    shippingAddress: {
        type: addressSchema,
        required: [true, "A morada é obrigatória."],
    },
    tipoEntrega: {
        type: String,
        required: [true, "O tipo de entrega é obrigatório."],
        enum: ["takeaway", "delivery"]
    },
    metodoPagamento: {
        type: String,
        required: [true, "O metodo de pagamento é obrigatório."],
        enum: ["dinheiro", "cartao"]
    }
    },
    { timestamps: true }
);

const Pedido = mongoose.model("Pedido", pedidoSchema);

export default Pedido;