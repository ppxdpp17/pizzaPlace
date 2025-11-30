import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    produtos: [
      {
        produto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Produto",
          required: true,
        },
        quantidade: {
          type: Number,
          required: true,
          min: 1,
        },
        preco: {
          type: Number,
          required: true,
          min: 0,
        },
        // --- NOVOS CAMPOS (SNAPSHOT) ---
        // Guardam os dados como eram no momento da compra
        nome: {
          type: String
        },
        imagem: {
          type: String
        },
        tamanho: {
          type: String,
        },
        meta: {
          type: Map,
          of: mongoose.Schema.Types.Mixed, // Flexibilidade para guardar cor, nota, arrays, etc.
        },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    stripeSessionID: {
      type: String,
      unique: true, // Garante que não processamos o mesmo webhook duas vezes
      sparse: true, // Permite null/undefined (para pagamentos em dinheiro)
    },
    tipoEntrega: {
      type: String,
      enum: ["takeaway", "delivery"],
      required: true,
    },
    metodoPagamento: {
      type: String,
      enum: ["mbway", "dinheiro", "cartao", "stripe"],
      required: true,
    },
    shippingAddress: {
      name: String,
      line1: String,
      line2: String,
      city: String,
      postal_code: String,
      country: String,
    },
    estado: {
      type: String,
      enum: ["Pendente", "Aguardando Pagamento", "A Cozinhar", "A Caminho", "Entregue", "Cancelado", "Falha Pagamento"],
      default: "A Cozinhar",
    },
    paymentId: {
      type: String,
    },
    localizacao: {
      type: String, // Loja onde foi feito o pedido
    },
  },
  { timestamps: true }
);

const Pedido = mongoose.model("Pedido", pedidoSchema);
export default Pedido;