import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore.js";
import EstadoDropdown from "./EstadoDropdown.jsx";

// Função auxiliar para calcular estado se não vier do backend
function calcularEstado(createdAt) {
  const minutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (minutes < 5) return "A Cozinhar...";
  if (minutes < 10) return "A caminho";
  return "Entregue!";
}

// Formatar Labels de Tamanho (Pequena -> Peq., etc)
function formatTamanhoLabel(tamanhoRaw) {
  if (!tamanhoRaw) return null;
  const t = String(tamanhoRaw).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (t === "pequena" || t === "peq" || t === "peq.") return "Peq.";
  if (t === "media" || t === "média" || t === "med" || t === "med.") return "Méd.";
  if (t === "grande" || t === "grd" || t === "grd.") return "Grd.";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Componente para mostrar colagem de imagens
function ImagemCollage({ imagens = [], altBase = "Produto" }) {
  const count = imagens.length;

  if (count === 0) {
    return (
      <div className="w-24 h-24 rounded-md bg-gray-700 flex items-center justify-center text-sm text-gray-400">
        Sem img
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
      <img src={imagens[1]} alt={`${altBase} 2`} className="object-cover w-full h/full rounded-tr-md" />
      <img src={imagens[2]} alt={`${altBase} 3`} className="object-cover w/full h/full rounded-bl-md" />
      <div className="relative w-full h-full rounded-br-md overflow-hidden">
        <img src={imagens[3] ?? imagens[0]} alt={`${altBase} 4`} className="object-cover w-full h/full" />
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
  const { user } = useUserStore();
  const isAdmin = user?.cargo === "admin";

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Todos');
  const intervalRef = useRef(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      // Se for Admin busca tudo, se for cliente busca só os seus (/me)
      const endpoint = isAdmin ? "/pedidos" : "/pedidos/me";
      const res = await axios.get(endpoint);

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
    // Atualiza a cada 30 segundos
    intervalRef.current = setInterval(fetchPedidos, 30000);
    return () => clearInterval(intervalRef.current);
  }, [isAdmin]); // Recarrega se o cargo mudar (login/logout)

  if (loading) return <p className="p-4 text-center text-gray-300">Carregando pedidos...</p>;
  if (error) return <p className="p-4 text-center text-red-400">Erro: {error}</p>;
  if (!pedidos.length) return <p className="p-4 text-center text-gray-400">Nenhum pedido encontrado.</p>;

  const filteredPedidos = pedidos.filter(pedido => {
    if (!isAdmin || selectedCity === 'Todos') return true;
    const city = pedido.shippingAddress?.city || (pedido.tipoEntrega === 'takeaway' ? 'Takeaway' : 'Outro');
    return city === selectedCity;
  });

  const cities = [
    'Todos',
    'Bragança (Shopping)',
    'Bragança (Av. Jõao da Cruz)',
    'Vila Real',
    'Chaves',
    'Braga'
  ];

  return (
    <div className="space-y-4 pb-24">
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-gray-700 text-white rounded-md px-3 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      )}

      {filteredPedidos.map((pedido) => {
        // --- LÓGICA DE IMAGENS ---
        // 1. Tenta imagem guardada no pedido (p.imagem)
        // 2. Se não existir, tenta no produto populado (p.produto.imagem)
        const imagens = (pedido.produtos ?? [])
          .map((p) => p.imagem || p.produto?.imagem)
          .filter(Boolean);

        const imagensFinal = imagens.length ? imagens : ["/placeholder.png"];

        // --- LÓGICA DE NOMES ---
        // 1. Tenta nome guardado no pedido (p.nome)
        // 2. Se não existir, tenta no produto populado (p.produto.nome)
        // 3. Fallback
        const nomes = (pedido.produtos ?? []).map((p) => p.nome || p.produto?.nome || "Produto Removido");
        const nomePedido = nomes.length === 1 ? nomes[0] : `${nomes[0]} +${Math.max(0, nomes.length - 1)}`;

        const address = pedido.shippingAddress || {};
        const total = Number(pedido.total ?? 0).toFixed(2);
        const estado = pedido.estado || calcularEstado(pedido.createdAt);

        // Tratamento de User nulo (caso o user tenha sido apagado)
        const userNome = pedido.user?.name || pedido.user?.nome || "Cliente (Desconhecido)";
        const userEmail = pedido.user?.email || "";

        return (
          <motion.div
            key={pedido._id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-stretch bg-gray-800/60 rounded-xl p-4 shadow-sm"
          >
            {/* COLUNA ESQUERDA: PREÇO E ESTADO */}
            <div className="w-40 flex-shrink-0 flex flex-col items-end pr-4 border-r border-gray-700">
              <div className="text-right">
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-xl font-semibold text-emerald-400">€{total}</div>
              </div>

              <div className="mt-auto pt-4 text-right">
                <div className="text-xs text-gray-400">Estado:</div>

                {isAdmin ? (
                  <div className="mt-1">
                    <EstadoDropdown
                      value={pedido.estado}
                      compact={true}
                      onChange={async (novoEstado) => {
                        // Atualização Otimista
                        setPedidos(prev => prev.map(p => p._id === pedido._id ? { ...p, estado: novoEstado } : p));
                        try {
                          await axios.patch(`/pedidos/${pedido._id}/estado`, { estado: novoEstado });
                        } catch (err) {
                          // Reverter em caso de erro
                          setPedidos(prev => prev.map(p => p._id === pedido._id ? { ...p, estado: pedido.estado } : p));
                          console.error("Erro estado:", err);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className={`mt-1 text-sm font-semibold ${estado === "A Cozinhar" || estado === "Aguardando Pagamento" ? "text-yellow-300" :
                    estado === "A Caminho" ? "text-amber-300" : "text-emerald-400"
                    }`}>
                    {estado === "A Cozinhar" ? "A cozinhar..." :
                      estado === "Aguardando Pagamento" ? "Aguardando..." :
                        estado === "A Caminho" ? "A caminho" :
                          estado === "Entregue" ? "Entregue!" : estado}
                  </div>
                )}
              </div>
            </div>

            {/* CONTEÚDO PRINCIPAL: INFO PEDIDO */}
            <div className="flex items-center gap-4 pl-4 flex-1">
              <ImagemCollage imagens={imagensFinal} altBase={nomePedido} />

              <div className="flex-1">
                {/* CABEÇALHO DO ITEM */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">{nomePedido}</div>
                    <div className="text-sm text-gray-300">
                      {userNome} {userEmail && <span className="text-xs text-gray-500">• {userEmail}</span>}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {pedido.createdAt ? new Date(pedido.createdAt).toLocaleString() : ""}
                  </div>
                </div>

                {/* MORADA E LOCALIZAÇÃO */}
                <div className="text-sm text-gray-300 mt-2">
                  {pedido.tipoEntrega === 'delivery' ? (
                    <>
                      <div className="font-medium text-white">{address.name}</div>
                      <div>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</div>
                      <div>{address.city} {address.postal_code && `• ${address.postal_code}`} {address.country && `• ${address.country}`}</div>
                    </>
                  ) : (
                    <div className="font-medium text-yellow-400">
                      Takeaway • Levantamento em: {pedido.localizacao}
                    </div>
                  )}
                </div>

                {/* DETALHES DE PAGAMENTO */}
                <div className="text-sm text-gray-400 mt-2">
                  Entrega: <span className="font-medium text-white capitalize">{pedido.tipoEntrega}</span>
                  {" • "}
                  Pagamento: <span className="font-medium text-white capitalize">{pedido.metodoPagamento === 'stripe' ? 'Cartão (Stripe)' : pedido.metodoPagamento}</span>
                </div>

                {/* LISTA DE PRODUTOS */}
                <div className="mt-3 space-y-1 text-sm text-gray-300 border-t border-gray-700/50 pt-2">
                  {pedido.produtos?.map((p, idx) => {
                    // Fallback triplo para tamanho
                    const tamanhoRaw = p.tamanho ?? p.meta?.tamanho ?? p.produto?.tamanho;
                    const tamanhoLabel = formatTamanhoLabel(tamanhoRaw);

                    // Fallback triplo para nome
                    const nomeProduto = p.nome || p.produto?.nome || "Produto Removido";

                    return (
                      <div key={idx} className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-white">{nomeProduto}</span>
                            {tamanhoLabel && <span className="text-gray-400 ml-2 text-xs uppercase bg-gray-700 px-1.5 py-0.5 rounded">
                              {tamanhoLabel}
                            </span>}
                            <span className="text-gray-400 text-xs"> × {p.quantidade}</span>
                          </div>
                          <div className="text-gray-400">€{(p.preco).toFixed(2)}</div>
                        </div>
                        {/* Detalhes para Pizza Personalizada (apenas Admin) */}
                        {isAdmin && (p.nome?.toLowerCase().includes("personalizada") || p.nome?.toLowerCase().includes("custom")) && (
                          <div className="ml-4 mt-1">
                            <details className="text-xs text-gray-400 cursor-pointer">
                              <summary className="hover:text-emerald-400 transition-colors">Ver Detalhes</summary>
                              <div className="pl-2 pt-1 border-l border-gray-600 mt-1 space-y-0.5">
                                {p.meta?.massa && <div><span className="text-gray-500">Massa:</span> {p.meta.massa}</div>}
                                {p.meta?.molho && <div><span className="text-gray-500">Molho:</span> {p.meta.molho}</div>}
                                {p.meta?.ingredientes && Array.isArray(p.meta.ingredientes) && (
                                  <div><span className="text-gray-500">Ingredientes:</span> {p.meta.ingredientes.join(", ")}</div>
                                )}
                                {p.meta?.nota && <div><span className="text-gray-500">Nota:</span> <span className="text-yellow-200/80">{p.meta.nota}</span></div>}
                              </div>
                            </details>
                          </div>
                        )}
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
  );
};

export default Pedidos;