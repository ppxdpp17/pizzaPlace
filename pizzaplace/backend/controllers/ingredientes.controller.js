import Ingrediente from "../models/ingrediente.model.js";

export const getTodosIngredientes = async (req, res) => {
  try {
    const ingredientes = await Ingrediente.find().sort({ nome: 1 });
    res.status(200).json({ ingredientes });
  } catch (err) {
    console.error("Erro getTodosIngredientes:", err);
    res.status(500).json({ msg: "Erro no servidor" });
  }
};

export const criarIngrediente = async (req, res) => {
  try {
    const { nome, icone } = req.body;
    if (!nome) return res.status(400).json({ msg: "Nome é obrigatório." });

    //Evita duplicados
    const existente = await Ingrediente.findOne({ nome: nome.trim() });
    if (existente) return res.status(400).json({ msg: "Ingrediente já existe." });

    const novo = await Ingrediente.create({ nome: nome.trim(), icone: icone || "" });
    res.status(201).json({ ingrediente: novo });
  } catch (err) {
    console.error("Erro criarIngrediente:", err);
    res.status(500).json({ msg: "Erro no servidor" });
  }
};
