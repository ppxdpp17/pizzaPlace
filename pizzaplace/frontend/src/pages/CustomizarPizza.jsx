// src/pages/CustomizarPizza.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useNavigate } from "react-router-dom";
import CartaoProduto from "../components/CartaoProduto";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const TAMANHOS = [
  { id: "small", label: "Pequena", multiplier: 1, base: 6 },
  { id: "medium", label: "Média", multiplier: 1.3, base: 8 },
  { id: "large", label: "Grande", multiplier: 1.6, base: 10 },
];

const MASSAS = [
  { id: "classic", label: "Massa Clássica" },
  { id: "thin", label: "Massa Fina" },
  { id: "thick", label: "Massa Grossa" },
];

const MOLHOS = [
  { id: "tomato", label: "Molho Tomate" },
  { id: "bbq", label: "Barbecue" },
  { id: "pesto", label: "Pesto" },
];

export default function CustomizarPizza() {
  const { user } = useUserStore();
  const { adicionarAoCarrinhoCustom } = useCarrinhoStore();
  const navigate = useNavigate();

  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [nome, setNome] = useState("A Minha Pizza");
  const [tamanho, setTamanho] = useState(TAMANHOS[1].id); // média por defeito
  const [massa, setMassa] = useState(MASSAS[0].id);
  const [molho, setMolho] = useState(MOLHOS[0].id);
  const [selecionados, setSelecionados] = useState([]); // ids ingrediente
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchIngredientes = async () => {
      try {
        const res = await axios.get("/ingredientes");
        const list = res.data.ingredientes ?? res.data;
        if (mounted) setIngredientes(list || []);
      } catch (err) {
        console.error("Erro ao buscar ingredientes:", err);
        toast.error("Não foi possível carregar ingredientes.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchIngredientes();
    return () => (mounted = false);
  }, []);

  const toggleIngrediente = (id) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // preco calculado: base do tamanho + 0.75 por topping
  const preco = useMemo(() => {
    const t = TAMANHOS.find(x => x.id === tamanho) ?? TAMANHOS[1];
    const base = t.base ?? 6;
    const toppingsPrice = (selecionados.length) * 0.75;
    return +(base * t.multiplier + toppingsPrice).toFixed(2);
  }, [tamanho, selecionados]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Por favor, faça login para adicionar produtos ao carrinho.");
      navigate("/login");
      return;
    }

    const chosenIngredients = ingredientes
      .filter(i => selecionados.includes(String(i._id ?? i.id)))
      .map(i => ({ _id: i._id ?? i.id, nome: i.nome, icone: i.icone }));

    // cria product object custom
    const customProduct = {
      // id client-side: marca como custom e gera id único
      _id: `custom-${Date.now()}`,
      nome,
      descricao: `${massa} · ${molho} · ${selecionados.length} toppings`,
      preco,
      imagem: "/make-your-own.png",
      categoria: "pizza",
      estaDisponivel: true,
      ingredientes: chosenIngredients,
      isCustom: true, // flag para store para tratar localmente
      meta: {
        tamanho,
        massa,
        molho,
        observacoes
      }
    };

    // use store method to add custom product (local)
    adicionarAoCarrinhoCustom(customProduct);
    toast.success("Pizza personalizada adicionada ao carrinho!");
    navigate("/carrinho");
  };

  if (loading) return <div className="p-8 text-center">Carregando…</div>;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.h1
          className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Costumizar Pizza
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
            {/* Form */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-sm">

              <div className="mb-4">
                <div className="text-sm text-gray-300 mb-2">Tamanho</div>
                <div className="flex gap-2">
                  {TAMANHOS.map(t => (
                    <button key={t.id} onClick={() => setTamanho(t.id)} className={`px-3 py-2 rounded ${t.id === tamanho ? "bg-emerald-600" : "bg-gray-700"} text-white`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-300 mb-2">Massa</div>
                <select value={massa} onChange={e => setMassa(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white">
                  {MASSAS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-300 mb-2">Molho</div>
                <select value={molho} onChange={e => setMolho(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white">
                  {MOLHOS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-300 mb-2">Toppings (cada um €0.75)</div>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-2">
                  {ingredientes.map(i => (
                    <label key={i._id ?? i.id} className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" checked={selecionados.includes(String(i._id ?? i.id))} onChange={() => toggle(i._id ?? i.id)} />
                      <span>{i.icone ? `${i.icone} ` : ""}{i.nome}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">Observações</label>
                <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" rows="3" />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-sm text-gray-300">Preço estimado</div>
                  <div className="text-2xl font-bold text-emerald-400">€{preco.toFixed(2)}</div>
                </div>
                <div>
                  <button onClick={handleAddToCart} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-white">
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            </div>

            {/*Preview (usa CartaoProduto para manter consistência visual)*/}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CartaoProduto product={{
                  _id: "preview-custom",
                  nome,
                  preco,
                  descricao: `${massa} · ${molho} · ${selecionados.length} toppings`,
                  imagem: "/makeYourOwn.png",
                  ingredientes: ingredientes.filter(i => selecionados.includes(String(i._id ?? i.id))).map(i => ({ _id: i._id ?? i.id, nome: i.nome, icone: i.icone }))
                }} />
              </div>
            </div>
        </motion.div>
      </div>
    </div>
  );

  function toggle(id) {
    setSelecionados(prev => prev.includes(String(id)) ? prev.filter(x => x !== String(id)) : [...prev, String(id)]);
  }
}
