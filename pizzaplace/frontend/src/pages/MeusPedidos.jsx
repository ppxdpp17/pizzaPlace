import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import axios from "../lib/axios";
import { Package } from "lucide-react";

function ImagemCollage({ imagens = [], altBase = "Produto" }) {
  const count = imagens.length;
  if (count === 0) {
    return (
      <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center text-sm text-gray-400">
        Sem imagem
      </div>
    );
  }
  if (count === 1) {
    return (
      <img src={imagens[0]} alt={altBase} className="w-16 h-16 rounded-md object-cover" />
    );
  }
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 w-16 h-16">
        <img src={imagens[0]} alt={`${altBase} 1`} className="object-cover w-full h-full rounded-l-md" />
        <img src={imagens[1]} alt={`${altBase} 2`} className="object-cover w-full h-full rounded-r-md" />
      </div>
    );
  }
  const extra = count - 3;
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1 w-16 h-16">
      <img src={imagens[0]} alt={`${altBase} 1`} className="object-cover w-full h-full rounded-tl-md" />
      <img src={imagens[1]} alt={`${altBase} 2`} className="object-cover w-full h/full rounded-tr-md" />
      <img src={imagens[2]} alt={`${altBase} 3`} className="object-cover w/full h/full rounded-bl-md" />
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

function formatTamanhoLabel(tamanhoRaw) {
  if (!tamanhoRaw) return null;
  const t = String(tamanhoRaw).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (t === "pequena" || t === "peq" || t === "peq.") return "Peq.";
  if (t === "media" || t === "média" || t === "med" || t === "med.") return "Méd.";
  if (t === "grande" || t === "grd" || t === "grd.") return "Grd.";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const MeusPedidosVazio = () => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-24"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Package className="h-24 w-24 text-gray-300" />
    <h3 className="text-2xl font-semibold">Ainda não realizou nenhum pedido.</h3>
    <p className="text-gray-400">Comece a explorar o menu e faça a sua primeira encomenda.</p>
    <Link
      to="/"
      className="mt-4 rounded-md bg-emerald-500 px-6 py-2 text-white transition-colors hover:bg-emerald-600"
    >
      Começar a Comprar
    </Link>
  </motion.div>
);

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/pedidos/me");
      const data = res.data.pedidos ?? res.data;
      setPedidos(data);
    } catch (err) {
      console.error("Erro a buscar meus pedidos:", err);
      setError(err.response?.data?.msg || err.message || "Erro ao buscar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
    intervalRef.current = setInterval(() => {
      fetchPedidos();
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) return <p className="p-4 text-center">A carregar...</p>;
  if (error) return <p className="p-4 text-center text-red-400">Erro: {error}</p>;
  if (!pedidos.length) return <div className="p-4"><MeusPedidosVazio /></div>;

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-2xl font-semibold text-emerald-400">Os Meus Pedidos</h2>

        {pedidos.map(pedido => {
          const imagens = (pedido.produtos ?? []).map(p => p.produto?.imagem).filter(Boolean);
          const imagensFinal = imagens.length ? imagens : ["/placeholder.png"];
          const nomes = (pedido.produtos ?? []).map(p => p.produto?.nome ?? "Produto");
          const nomePedido = nomes.length === 1 ? nomes[0] : `${nomes[0]} +${Math.max(0, nomes.length - 1)}`;
          const address = pedido.shippingAddress || {};
          const total = Number(pedido.total ?? 0).toFixed(2);

          //Usar "A cozinhar" (por defeito) ou o que está guardado no "pedido"
          const estado = pedido.estado || "A Cozinhar";

          //Mapping para cor e label
          const estadoLabel = estado === "A Cozinhar" ? "A cozinhar..." :
            estado === "A Caminho" ? "A caminho" : "Entregue!";
          const estadoColor = estado === "A Cozinhar" ? "text-yellow-300" :
            estado === "A Caminho" ? "text-amber-300" : "text-emerald-400";

          const dataHora = pedido.createdAt ? new Date(pedido.createdAt).toLocaleString() : "";

          return (
            <motion.div
              key={pedido._id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-stretch bg-gray-800/60 rounded-xl p-4 shadow-sm"
            >
              <div className="w-24 flex-shrink-0 flex flex-col items-end pr-4 border-r border-gray-700">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total</div>
                  <div className="text-xl font-semibold text-emerald-400">€{total}</div>
                </div>
                <div className="mt-auto pt-4 text-right">
                  <div className="text-xs text-gray-400">Estado:</div>
                  <div className={`mt-1 text-sm font-semibold ${estadoColor}`}>{estadoLabel}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pl-4 flex-1">
                <ImagemCollage imagens={imagensFinal} altBase={nomePedido} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">{nomePedido}</div>
                      <div className="text-sm text-gray-300 mt-1">{address.name}</div>
                    </div>
                    <div className="text-sm text-gray-400">{dataHora}</div>
                  </div>

                  <div className="text-sm text-gray-400 mt-2">
                    {address.line1}{address.line2 ? `, ${address.line2}` : ""} {address.city}
                  </div>
                  <div className="text-sm text-gray-400">
                    {address.postal_code} {address.country}
                  </div>

                  <div className="text-sm text-gray-400 mt-2">
                    Entrega: <span className="font-medium text-white">{pedido.tipoEntrega}</span>
                    <div></div>
                    Pagamento: <span className="font-medium text-white">{pedido.metodoPagamento}</span>
                  </div>

                  <div className="mt-2 text-sm text-gray-300">
                    {pedido.produtos?.map((p, idx) => {
                      // tentar extrair o tamanho de várias possíveis localizações
                      const tamanhoRaw =
                        p.tamanho ??
                        p.meta?.tamanho ??
                        p.produto?.tamanho ??
                        p.produto?.meta?.tamanho ??
                        (p.produto && typeof p.produto === "object" ? p.produto.meta?.tamanho : undefined);

                      const tamanhoLabel = formatTamanhoLabel(tamanhoRaw);

                      // nome do produto (se produto estiver populado use p.produto.nome, senão p.nome)
                      const nomeProduto = p.produto?.nome ?? p.nome ?? "Produto";

                      // preço: garantir .toFixed(2) sem erro
                      const preco = Number(p.preco ?? 0).toFixed(2);

                      return (
                        <div key={idx} className="flex justify-between">
                          <div>
                            <span className="font-medium text-white">{nomeProduto}</span>
                            {tamanhoLabel && <span className="text-gray-400 ml-2">({tamanhoLabel})</span>}
                            <span className="text-gray-400 ml-2">× {p.quantidade}</span>
                          </div>
                          <div className="text-gray-400">€{preco}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
