import { useEffect, useMemo, useState } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useNavigate } from "react-router-dom";
import CartaoProduto from "../components/CartaoProduto";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import OptionDropdown from "../components/OptionDropdown";
import IngredientsSelector from "../components/IngredientsSelector";
import { Shell, Badge, ShoppingCart as ShoppingCartIcon } from "lucide-react";

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

  //state
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(true);

  //default name (fixed)
  const nomePadrao = "Pizza Costumizada";

  //Form state
  const [tamanho, setTamanho] = useState(TAMANHOS[1].id);
  const [massa, setMassa] = useState(MASSAS[0].id);
  const [molho, setMolho] = useState(MOLHOS[0].id);
  const [selecionados, setSelecionados] = useState([]); //ids
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

  const preco = useMemo(() => {
    const t = TAMANHOS.find((x) => x.id === tamanho) ?? TAMANHOS[1];
    const base = t.base ?? 6;
    const toppingsPrice = selecionados.length * 0.75;
    return +(base * t.multiplier + toppingsPrice).toFixed(2);
  }, [tamanho, selecionados]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Por favor, faça login para adicionar produtos ao carrinho.");
      navigate("/login");
      return;
    }

    const chosenIngredients = ingredientes
      .filter((i) => selecionados.includes(String(i._id ?? i.id)))
      .map((i) => ({ _id: i._id ?? i.id, nome: i.nome, icone: i.icone }));

    const customProduct = {
      _id: `custom-${Date.now()}`,
      nome: nomePadrao,
      descricao: `${massa} · ${molho} · ${selecionados.length} toppings`,
      preco,
      imagem: "/makeYourOwn.png",
      categoria: "pizza",
      estaDisponivel: true,
      ingredientes: chosenIngredients,
      isCustom: true,
      meta: { tamanho, massa, molho, observacoes },
    };

    adicionarAoCarrinhoCustom(customProduct);
    toast.success("Pizza personalizada adicionada ao carrinho!");
    navigate("/carrinho");
  };

  const handleCancel = () => {
    setTamanho(TAMANHOS[1].id);
    setMassa(MASSAS[0].id);
    setMolho(MOLHOS[0].id);
    setSelecionados([]);
    setObservacoes("");
    navigate(-1);
  };

  if (loading) return <div className="p-8 text-center">A Carregar...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-6xl bg-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-6" style={{ minHeight: 640 }}>
        <motion.h1 className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          Personalizar Pizza
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 flex flex-col gap-4">
            <div>
              <div className="text-sm text-gray-300 mb-2">Tamanho</div>
              <div className="flex gap-2">
                {TAMANHOS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTamanho(t.id)} className={`px-3 py-2 rounded text-white text-sm ${t.id === tamanho ? "bg-emerald-600" : "bg-gray-700"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-300 mb-2">Massa</div>
                <OptionDropdown options={MASSAS} value={massa} onChange={setMassa} placeholder="Escolher massa" Icon={Badge} />
              </div>

              <div>
                <div className="text-sm text-gray-300 mb-2">Molho</div>
                <OptionDropdown options={MOLHOS} value={molho} onChange={setMolho} placeholder="Escolher molho" Icon={Shell} />
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-300 mb-2">Toppings (cada um €0.75)</div>
              <IngredientsSelector value={selecionados} onChange={setSelecionados} allowAdd={false} />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Observações</label>
              <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600" rows="4" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between shadow-sm">
            {/*Preço no topo da coluna*/}
            <div className="mb-4">
              <div className="text-sm text-gray-300">Preço estimado</div>
              <div className="text-2xl font-bold text-emerald-400">€{preco.toFixed(2)}</div>
            </div>

            <div className="mb-4">
              {/*Esconde-se o preço e ações no cartão de preview*/}
              <CartaoProduto
                product={{
                  _id: "preview-custom",
                  nome: nomePadrao,
                  preco,
                  descricao: `${massa} · ${molho} · ${selecionados.length} toppings`,
                  imagem: "/makeYourOwn.png",
                  ingredientes: ingredientes.filter((i) => selecionados.includes(String(i._id ?? i.id))).map(i => ({ _id: i._id ?? i.id, nome: i.nome, icone: i.icone }))
                }}
                hideActions
                hidePrice
              />
            </div>

            {/*Botões empilhados em baixo*/}
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={handleAddToCart} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-white font-medium">
                <ShoppingCartIcon size={18} />
                Adicionar ao carrinho
              </button>

              <button onClick={handleCancel} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white text-sm">
                Anular
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-400">Ao adicionar a pizza personalizada, ela será colocada no carrinho como um item separado.</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
