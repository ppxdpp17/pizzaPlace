import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import axios from "../lib/axios";
import { Package } from "lucide-react";

function ImagemCollage({ imagens = [], altBase = "Produto" }) {
  const count = imagens.length;
  if (count === 0) {
    return (
      <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500 border border-gray-200">
        Sem img
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
    className="flex flex-col items-center justify-center space-y-4 py-20 bg-white/90 rounded-xl shadow-md border border-gray-100 max-w-xl mx-auto mt-10 backdrop-blur-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Package className="h-24 w-24 text-gray-400" />
    <h3 className="text-2xl font-semibold text-gray-900">Ainda não realizou nenhum pedido.</h3>
    <p className="text-gray-600">Comece a explorar o menu e faça a sua primeira encomenda.</p>
    <Link
      to="/"
      className="mt-6 rounded-md bg-red-600 px-8 py-3 text-white font-medium transition-colors hover:bg-red-700 shadow-sm"
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

  if (loading) return (
    <div className="p-4 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed bg-gray-50 flex items-center justify-center" style={{ backgroundImage: "url('/piuzz.png')" }}>
      <div className="bg-white/90 p-6 rounded-xl shadow-md border border-gray-100 backdrop-blur-sm">
        <p className="text-lg text-gray-700 font-medium">A carregar...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="p-4 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed bg-gray-50 flex items-center justify-center" style={{ backgroundImage: "url('/piuzz.png')" }}>
      <div className="bg-white/90 p-6 rounded-xl shadow-md border border-gray-100 backdrop-blur-sm">
        <p className="text-red-500 font-medium">Erro: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed bg-gray-50" style={{ backgroundImage: "url('/piuzz.png')" }}>

      {!pedidos.length ? (
        <MeusPedidosVazio />
      ) : (
        <div className="max-w-7xl mx-auto space-y-4">
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-700 mt-4 mb-8 drop-shadow-sm">
            Os Meus Pedidos
          </h2>

          {pedidos.map(pedido => {
            const imagens = (pedido.produtos ?? []).map(p => p.imagem || p.produto?.imagem).filter(Boolean);
            const imagensFinal = imagens.length ? imagens : ["/placeholder.png"];
            // --- LÓGICA DE NOMES (HEADER) ---
            const nomes = (pedido.produtos ?? []).map(p => p.nome ?? p.produto?.nome ?? "Produto");
            const nomePedido = nomes.length === 1 ? nomes[0] : `${nomes[0]} +${Math.max(0, nomes.length - 1)}`;
            const address = pedido.shippingAddress || {};
            const total = Number(pedido.total ?? 0).toFixed(2);

            const estado = pedido.estado || "A Cozinhar";

            const estadoLabel = estado === "A Cozinhar" ? "A cozinhar..." :
              estado === "A Caminho" ? "A caminho" : "Entregue!";
            const estadoColor = estado === "A Cozinhar" ? "text-orange-500" :
              estado === "A Caminho" ? "text-yellow-600" : "text-green-600";

            const dataHora = pedido.createdAt ? new Date(pedido.createdAt).toLocaleString() : "";

            return (
              <motion.div
                key={pedido._id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-stretch bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-32 flex-shrink-0 flex flex-col items-end pr-4 border-r border-gray-200">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 font-medium">Total</div>
                    <div className="text-xl font-bold text-red-600">€{total}</div>
                  </div>
                  <div className="mt-auto pt-4 text-right">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Estado</div>
                    <div className={`mt-1 text-sm font-bold ${estadoColor}`}>{estadoLabel}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-4 flex-1">
                  <ImagemCollage imagens={imagensFinal} altBase={nomePedido} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{nomePedido}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{address.name}</div>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">{dataHora}</div>
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ""} {address.city}
                    </div>
                    <div className="text-sm text-gray-600">
                      {address.postal_code} {address.country}
                    </div>

                    <div className="text-sm text-gray-600 mt-3 pt-2 flex gap-4">
                      <span>
                        Entrega: <span className="font-semibold text-gray-900 capitalize">{pedido.tipoEntrega}</span>
                      </span>
                      <span>
                        Pagamento: <span className="font-semibold text-gray-900 capitalize">{pedido.metodoPagamento === 'stripe' ? 'Cartão' : pedido.metodoPagamento}</span>
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      {pedido.produtos?.map((p, idx) => {
                        const tamanhoRaw =
                          p.tamanho ??
                          p.meta?.tamanho ??
                          p.produto?.tamanho ??
                          p.produto?.meta?.tamanho ??
                          (p.produto && typeof p.produto === "object" ? p.produto.meta?.tamanho : undefined);

                        const tamanhoLabel = formatTamanhoLabel(tamanhoRaw);
                        const nomeProduto = p.nome ?? p.produto?.nome ?? "Produto";
                        const preco = Number(p.preco ?? 0).toFixed(2);

                        return (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 p-1.5 rounded-md border border-gray-100">
                            <div>
                              <span className="font-semibold text-gray-800">{nomeProduto}</span>
                              {tamanhoLabel && <span className="text-xs text-gray-600 font-medium ml-2 bg-gray-200 px-1.5 py-0.5 rounded">
                                {tamanhoLabel}
                              </span>}
                              <span className="text-gray-500 ml-2 text-xs font-semibold">× {p.quantidade}</span>
                            </div>
                            <div className="text-gray-700 font-medium">€{preco}</div>
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
      )}
    </div>
  );
}
