import Pedido from "../models/pedidos.model.js";

export const getTodosPedidos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const pedidos = await Pedido.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("produtos.produto", "nome imagem preco");

    const total = await Pedido.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({ pedidos, totalPages, currentPage: page });
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    return res.status(500).json({ msg: "Erro no servidor" });
  }
};

export const getPedidosDoUtilizador = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const pedidos = await Pedido.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("produtos.produto", "nome imagem preco"); 

    const total = await Pedido.countDocuments({ user: userId });
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({ pedidos, totalPages, currentPage: page });

  } catch (err) {
    console.error("Erro ao buscar pedidos do user:", err);
    return res.status(500).json({ msg: "Erro no servidor" });
  }
};

//Função para calcular estado com base no tempo passado
/* function calcularEstadoPorTempo(createdAt) {
  if (!createdAt) return "A Cozinhar";
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (mins < 5) return "A Cozinhar";
  if (mins < 10) return "Em entrega";
  return "Entregue";
} */

export const updatePedidoEstado = async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const { estado } = req.body;

    const estadosPermitidos = ["A Cozinhar", "A Caminho", "Entregue"];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ msg: "Estado inválido." });
    }

    //Só admins podem mudar
    if (!req.user || req.user.cargo !== "admin") {
      return res.status(403).json({ msg: "Acesso negado. Apenas administradores." });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      pedidoId,
      { $set: { estado } },
      { new: true }
    ).populate("produtos.produto", "nome imagem preco")
     .populate("user", "name email");

    if (!pedido) {
      return res.status(404).json({ msg: "Pedido não encontrado." });
    }

    return res.status(200).json({ success: true, pedido });
  } catch (err) {
    console.error("Erro ao actualizar estado do pedido:", err);
    return res.status(500).json({ msg: "Erro no servidor" });
  }
};