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
      imagem: "/makeYourOwn2.png",
      categoria: "pizza",
      estaDisponivel: true,
      ingredientes: chosenIngredients,
      isCustom: true,
      meta: {
        tamanho,
        massa,
        molho,
        nota: observacoes, // Mapear para 'nota' como esperado pelo Pedidos.jsx
        ingredientes: chosenIngredients.map(i => i.nome) // Guardar nomes para exibir
      },
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

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">A Carregar...</div>;

  return (
    <div className="min-h-screen bg-gray-50 bg-cover bg-center bg-no-repeat bg-fixed py-12" style={{ backgroundImage: "url('/piuzz.png')" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex items-center justify-center px-4">
        <div className="w-full max-w-6xl bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-6" style={{ minHeight: 640 }}>
          <motion.h1 className="text-center text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mb-8 pb-3 border-b border-gray-100" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            Personalizar Pizza
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col gap-6">
              <div>
                <div className="text-sm font-bold text-gray-700 mb-3">Tamanho</div>
                <div className="flex gap-2">
                  {TAMANHOS.map((t) => (
                    <button key={t.id} type="button" onClick={() => setTamanho(t.id)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${t.id === tamanho ? "bg-red-600 text-white transform scale-105" : "bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-bold text-gray-700 mb-2">Massa</div>
                  <OptionDropdown options={MASSAS} value={massa} onChange={setMassa} placeholder="Escolher massa" Icon={Badge} />
                </div>

                <div>
                  <div className="text-sm font-bold text-gray-700 mb-2">Molho</div>
                  <OptionDropdown options={MOLHOS} value={molho} onChange={setMolho} placeholder="Escolher molho" Icon={Shell} />
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-gray-700 mb-2">Toppings <span className="text-red-500 font-medium">(cada um €0.75)</span></div>
                <div className="p-1 border border-gray-200 rounded-lg bg-white">
                  <IngredientsSelector value={selecionados} onChange={setSelecionados} allowAdd={false} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Observações</label>
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="w-full p-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm" rows="3" placeholder="Adicione instruções especiais..." />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col justify-between shadow-sm">
              {/*Preço no topo da coluna*/}
              <div className="mb-4">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Preço estimado</div>
                <div className="text-4xl font-black text-red-600">€{preco.toFixed(2)}</div>
              </div>

              <div className="mb-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                {/*Esconde-se o preço e ações no cartão de preview*/}
                <CartaoProduto
                  product={{
                    _id: "preview-custom",
                    nome: nomePadrao,
                    preco,
                    descricao: `${massa} · ${molho} · ${selecionados.length} toppings`,
                    imagem: "/makeYourOwn2.png",
                    ingredientes: ingredientes.filter((i) => selecionados.includes(String(i._id ?? i.id))).map(i => ({ _id: i._id ?? i.id, nome: i.nome, icone: i.icone }))
                  }}
                  hideActions
                  hidePrice
                />
              </div>

              {/*Botões empilhados em baixo*/}
              <div className="mt-6 flex flex-col gap-3">
                <button onClick={handleAddToCart} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition-colors px-4 py-3 rounded-lg text-white font-bold shadow-md">
                  <ShoppingCartIcon size={20} />
                  Adicionar ao carrinho
                </button>

                <button onClick={handleCancel} className="bg-white hover:bg-gray-100 border border-gray-300 transition-colors px-4 py-2.5 rounded-lg text-gray-700 font-bold shadow-sm">
                  Cancelar
                </button>
              </div>

              <div className="mt-4 text-xs font-medium text-gray-500 text-center">Ao adicionar a pizza personalizada, ela será colocada no carrinho como um item separado.</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
