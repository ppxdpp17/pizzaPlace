import Pedido from "../models/pedidos.model.js";

export const getTodosPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("produtos.produto", "nome imagem preco");

    return res.status(200).json({ pedidos });
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    return res.status(500).json({ msg: "Erro no servidor" });
  }
};
