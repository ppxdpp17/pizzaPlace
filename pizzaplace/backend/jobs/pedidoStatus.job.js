import cron from "node-cron";
import Pedido from "../models/pedidos.model.js";

export function startPedidoStatusJob() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = Date.now();
      const fiveMinAgo = new Date(now - 5 * 60 * 1000);
      const tenMinAgo = new Date(now - 10 * 60 * 1000);

      //Marca como "Entregue" todos os pedidos (não 'Entregue') com createdAt <= 10m
      const resEntregue = await Pedido.updateMany(
        { estado: { $ne: "Entregue" }, createdAt: { $lte: tenMinAgo } },
        { $set: { estado: "Entregue" } }
      );

      //Marca como "Em entrega" os que ainda estão "A cozinhar" e createdAt <= 5m
      const resEmEntrega = await Pedido.updateMany(
        { estado: "A Cozinhar", createdAt: { $lte: fiveMinAgo } },
        { $set: { estado: "Em entrega" } }
      );

      if ((resEntregue.modifiedCount ?? resEntregue.nModified) > 0 ||
          (resEmEntrega.modifiedCount ?? resEmEntrega.nModified) > 0) {
        console.log(`PedidoStatusJob:update — Entregue:${resEntregue.modifiedCount || resEntregue.nModified} EmEntrega:${resEmEntrega.modifiedCount || resEmEntrega.nModified}`);
      }
    } catch (err) {
      console.error("Erro no PedidoStatusJob:", err);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log("PedidoStatusJob iniciado (a executar a cada minuto).");
}
