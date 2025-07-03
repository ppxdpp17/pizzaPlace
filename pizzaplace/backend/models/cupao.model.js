import mongoose from "mongoose";

const cupaoSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: [true, "O codigo é obrigatório."],
            unique: true,
        },
        percentagemDesconto: {
            type: Number,
            required: [true, "O desconto é obrigatório."],
            min: 0,
            max: 100
        },
        dataExpiracao: {
            type: Date,
            required: [true, "A data de expiração é obrigatória."],
        },
        ativo: {
            type: Boolean,
            default: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "O id do user é obrigatório."],
            unique: true
        }
    },
    {
        timestamps: true,
    }
)

const Cupao = mongoose.model("Cupao", cupaoSchema);

export default Cupao;