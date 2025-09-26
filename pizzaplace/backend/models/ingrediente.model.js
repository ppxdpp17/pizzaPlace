import mongoose from "mongoose";

const ingredienteSchema = new mongoose.Schema(
  {
    nome: { 
      type: String, 
      required: true,
      trim: true 
    },

    icone: { 
      type: String 
    }
  }, 
  { 
    timestamps: true 
  }
);

const Ingrediente = mongoose.model("Ingrediente", ingredienteSchema);
export default Ingrediente;
