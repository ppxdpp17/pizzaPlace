// src/components/Pedidos.jsx
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios";

function calcularEstado(createdAt) {
  const minutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (minutes < 5) return "A Cozinhar...";
  if (minutes < 10) return "A caminho";
  return "Entregue!";
}

function ImagemCollage({ imagens = [], altBase = "Produto" }) {
  //Mostra até 4 imagens; se houver mais, o último mostra +N
  const count = imagens.length;
  if (count === 0) {
    return (
      <div className="w-24 h-24 rounded-md bg-gray-700 flex items-center justify-center text-sm text-gray-400">
        Sem imagem
      </div>
    );
  }
  if (count === 1) {
    return (
      <img
        src={imagens[0]}
        alt={`${altBase} 1`}
        className="w-24 h-24 rounded-md object-cover bg-gray-700 flex-shrink-0"
      />
    );
  }
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 w-24 h-24">
        <img src={imagens[0]} alt={`${altBase} 1`} className="object-cover w-full h-full rounded-l-md" />
        <img src={imagens[1]} alt={`${altBase} 2`} className="object-cover w-full h-full rounded-r-md" />
      </div>
    );
  }
  const extra = count - 3;
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1 w-24 h-24">
      <img src={imagens[0]} alt={`${altBase} 1`} className="object-cover w-full h-full rounded-tl-md" />
      <img src={imagens[1]} alt={`${altBase} 2`} className="object-cover w-full h-full rounded-tr-md" />
      <img src={imagens[2]} alt={`${altBase} 3`} className="object-cover w-full h-full rounded-bl-md" />
      <div className="relative w-full h-full rounded-br-md overflow-hidden">
        <img src={imagens[3] ?? imagens[0]} alt={`${altBase} 4`} className="object-cover w-full h-full" />
        {extra > 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-semibold">
            +{extra}
          </div>
        )}
      </div>
    </div>
  );
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
      fetchPedidos();
    }, 30000); // 30s
    return () => clearInterval(intervalRef.current);
  }, []);


  if (loading) return <p className="p-4 text-center">Carregando pedidos...</p>;
  if (error) return <p className="p-4 text-center text-red-400">Erro: {error}</p>;
  if (!pedidos.length) return <p className="p-4 text-center">Nenhum pedido encontrado.</p>;

  return (
    <div className="space-y-4">
      {pedidos.map((pedido) => {
        //Extrair imagens de todos os produtos do pedido
        const imagens = (pedido.produtos ?? [])
          .map((p) => p.produto?.imagem)
          .filter(Boolean);
        //Fallback: se não houver imagens, usar placeholder
        const imagensFinal = imagens.length ? imagens : ["/placeholder.png"];

        //Título: se houver só um produto, usa o seu nome, senão concatena nomes
        const nomes = (pedido.produtos ?? []).map((p) => p.produto?.nome ?? "Produto");
        const nomePedido = nomes.length === 1 ? nomes[0] : `${nomes[0]} +${Math.max(0, nomes.length - 1)}`;

        const address = pedido.shippingAddress || {};
        const total = Number(pedido.total ?? 0).toFixed(2);
        const estado = pedido.estado || calcularEstado(pedido.createdAt);

        const estadoColor =
          estado === "A Cozinhar" ? "text-yellow-300" :
          estado === "Em entrega" ? "text-amber-300" : "text-emerald-400";

        const userNome = pedido.user?.nome ?? "Cliente";
        const userEmail = pedido.user?.email ?? "";

        return (
          <motion.div
            key={pedido._id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-stretch bg-gray-800/60 rounded-xl p-4 shadow-sm"
          >
            {/*Coluna esquerda: total + estado*/}
            <div className="w-40 flex-shrink-0 flex flex-col items-end pr-4 border-r border-gray-700">
              <div className="text-right">
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-xl font-semibold text-emerald-400">€{total}</div>
              </div>
              <div className="mt-auto pt-4 text-right">
                <div className="text-xs text-gray-400">Estado:</div>
                <div className={`mt-1 text-sm font-semibold ${estadoColor}`}>{estado}</div>
              </div>
            </div>
            {/*Conteúdo principal: imagens + infos*/}
            <div className="flex items-center gap-4 pl-4 flex-1">
              <ImagemCollage imagens={imagensFinal} altBase={nomePedido} />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">{nomePedido}</div>
                    <div className="text-sm text-gray-300">{userNome} {userEmail && <span className="text-xs text-gray-500">• {userEmail}</span>}</div>
                  </div>
                  <div className="text-sm text-gray-400">{pedido.createdAt ? new Date(pedido.createdAt).toLocaleString() : ""}</div>
                </div>
                {/*Morada*/}
                <div className="text-sm text-gray-300 mt-2">
                  <div className="font-medium text-white">{address.name}</div>
                  <div>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</div>
                  <div>{address.city} • {address.postal_code} • {address.country}</div>
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Entrega: <span className="font-medium text-white">{pedido.tipoEntrega}</span>
                  {"  •  "}
                  Pagamento: <span className="font-medium text-white">{pedido.metodoPagamento}</span>
                </div>
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
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Pedidos;
