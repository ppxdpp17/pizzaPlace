// src/components/Pedidos.jsx
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios";

function calcularEstado(createdAt) {
  const minutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (minutes < 5) return "A cozinhar...";
  if (minutes < 10) return "A caminho";
  return "Entregue!";
}

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/pedidos");
      const data = res.data.pedidos ?? res.data;
      setPedidos(data);
    } catch (err) {
      console.error("Erro a buscar pedidos:", err);
      setError(err.response?.data?.msg || err.message || "Erro ao buscar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();

    intervalRef.current = setInterval(() => {
      setPedidos((p) => [...p]);
    }, 30000);

    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) return <p className="p-4 text-center">Carregando pedidos...</p>;
  if (error) return <p className="p-4 text-center text-red-400">Erro: {error}</p>;
  if (!pedidos.length) return <p className="p-4 text-center">Nenhum pedido encontrado.</p>;

  return (
    <div className="space-y-4">
      {pedidos.map((pedido) => {
        const primeiro = pedido.produtos?.[0] ?? {};
        const produtoPop = primeiro.produto ?? {};
        const imagem = produtoPop.imagem || "/placeholder.png";
        const nomePedido = produtoPop.nome || `Pedido #${String(pedido._id).slice(-6)}`;
        const address = pedido.shippingAddress || {};
        const total = Number(pedido.total ?? 0).toFixed(2);
        const estado = calcularEstado(pedido.createdAt);

        const estadoColor =
          estado === "A cozinhar..." ? "text-yellow-300" :
          estado === "A caminho" ? "text-amber-300" : "text-emerald-400";

        return (
          <motion.div
            key={pedido._id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-stretch bg-gray-800/60 rounded-xl p-4 shadow-sm"
          >
            {/* Coluna esquerda: total + estado */}
            <div className="w-40 flex-shrink-0 flex flex-col items-end pr-4 border-r border-gray-700">
              <div className="text-right">
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-xl font-semibold text-emerald-400">€{total}</div>
              </div>

              <div className="mt-auto pt-4 text-right">
                <div className="text-xs text-gray-400">Estado:</div>
                <div className={`mt-1 text-sm font-semibold ${estadoColor}`}>
                  {estado}
                </div>
              </div>
            </div>

            {/* Conteúdo principal: imagem + infos */}
            <div className="flex items-center gap-4 pl-4 flex-1">
              <img
                src={imagem}
                alt={nomePedido}
                className="w-24 h-24 rounded-md object-cover bg-gray-700 flex-shrink-0"
              />

              <div className="flex-1">
                <div className="text-lg font-semibold text-white">{nomePedido}</div>

                {/* endereço do utilizador */}
                <div className="text-sm text-gray-300 mt-1">
                  {address.name}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ""} • {address.city}
                </div>
                <div className="text-sm text-gray-400">
                  {address.postal_code} • {address.country}
                </div>

                <div className="text-sm text-gray-400 mt-2">
                  Entrega: <span className="font-medium text-white">{pedido.tipoEntrega}</span>
                  {"  •  "}
                  Pagamento: <span className="font-medium text-white">{pedido.metodoPagamento}</span>
                </div>

                {/* lista resumida dos produtos pedidos */}
                <div className="mt-2 text-sm text-gray-300">
                  {pedido.produtos?.map((p, idx) => (
                    <div key={idx} className="flex justify-between">
                      <div>
                        <span className="font-medium text-white">{p.produto?.nome ?? "Produto"}</span>
                        <span className="text-gray-400"> × {p.quantidade}</span>
                      </div>
                      <div className="text-gray-400">€{(p.preco).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* coluna direita: data / ações */}
              <div className="w-36 text-right flex-shrink-0">
                <div className="text-xs text-gray-400 mb-2">
                  {pedido.createdAt ? new Date(pedido.createdAt).toLocaleString() : ""}
                </div>
                <button
                  onClick={() => navigator.clipboard?.writeText(pedido._id)}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-emerald-300"
                >
                  Copiar ID
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default Pedidos