import Pedido from "../models/pedidos.model.js";

export const getTodosPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("produtos.produto", "nome imagem preco");

      const pedidosComEstado = pedidos.map(p => {
        const o = p.toObject();
        o.estadoAtual = o.estado || calcularEstadoPorTempo(o.createdAt);
        return o;
      });
    return res.status(200).json({ pedidos: pedidosComEstado });

  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    return res.status(500).json({ msg: "Erro no servidor" });
  }
};

export const getPedidosDoUtilizador = async (req, res) => {
  try {
    const userId = req.user._id;

    const pedidos = await Pedido.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("produtos.produto", "nome imagem preco"); 

    const pedidosComEstado = pedidos.map(p => {
      const o = p.toObject();
      o.estadoAtual = o.estado || calcularEstadoPorTempo(o.createdAt);
      return o;
    });
    return res.status(200).json({ pedidos: pedidosComEstado });

  } catch (err) {
    console.error("Erro ao buscar pedidos do user:", err);
    return res.status(500).json({ msg: "Erro no servidor" });
  }
};

function calcularEstadoPorTempo(createdAt) {
  if (!createdAt) return "A cozinhar";
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (mins < 5) return "A cozinhar";
  if (mins < 10) return "Em entrega";
  return "Entregue";
}


