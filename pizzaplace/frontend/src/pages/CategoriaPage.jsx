import { useEffect, useMemo, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CartaoProduto from "../components/CartaoProduto";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import OptionDropdown from "../components/OptionDropdown";

const TAMANHOS = [
  { value: "pequena", label: "Pequena" },
  { value: "media", label: "Média" },
  { value: "grande", label: "Grande" },
];

const CategoriaPage = () => {
  const { getProdutosCategoria, products } = useProductStore();
  const { categoria } = useParams();
  const navigate = useNavigate();

  const { adicionarAoCarrinho } = useCarrinhoStore();
  const { user } = useUserStore();

  useEffect(() => {
    getProdutosCategoria(categoria);
  }, [getProdutosCategoria, categoria]);

  //Modal state e selecções
  const [modalOpen, setModalOpen] = useState(false);
  const [pizzaA, setPizzaA] = useState(null);
  const [pizzaB, setPizzaB] = useState(null);
  const [tamanho, setTamanho] = useState(null);

  //Opções derivadas dos products
  const pizzaOptions = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.map((p) => ({ value: p._id, label: p.nome }));
  }, [products]);

  const closeModal = () => {
    setModalOpen(false);
    setPizzaA(null);
    setPizzaB(null);
    setTamanho(null);
  };

  const handleAddMixToCart = () => {
    try {
      // normalizador (mantém a versão robusta que tens)
      const normalizeSel = (sel) => {
        if (!sel && sel !== 0) return null;
        if (typeof sel === "object") return sel.value ?? sel._id ?? sel.id ?? sel.label ?? null;
        return String(sel);
      };

      const rawA = normalizeSel(pizzaA);
      const rawB = normalizeSel(pizzaB);
      const tamanhoVal = typeof tamanho === "object" ? (tamanho.value ?? tamanho) : tamanho;

      if (!user) {
        toast.error("Por favor, faça login para adicionar produtos ao carrinho.");
        navigate("/login");
        return;
      }
      if (!rawA || !rawB) {
        toast.error("Escolha as duas pizzas.");
        return;
      }
      if (!tamanhoVal) {
        toast.error("Escolha um tamanho.");
        return;
      }

      if (!Array.isArray(products) || products.length === 0) {
        toast.error("Produtos ainda não carregados. Tente novamente em alguns segundos.");
        return;
      }

      const findByAny = (raw) => {
        if (!raw) return null;
        const byId = products.find((p) => String(p._id) === String(raw));
        if (byId) return byId;
        const norm = String(raw).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return products.find((p) => (String(p.nome ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")).includes(norm));
      };

      const pA = findByAny(rawA);
      const pB = findByAny(rawB);

      if (!pA || !pB) {
        toast.error("Seleção inválida das pizzas.");
        return;
      }

      // soma e arredonda o preço para o inteiro mais próximo
      const precoA = typeof pA.preco === "number" ? pA.preco : Number(pA.preco) || 0;
      const precoB = typeof pB.preco === "number" ? pB.preco : Number(pB.preco) || 0;
      const precoSomado = precoA + precoB;
      const precoArredondado = Math.round(precoSomado);

      const mixProduct = {
        _id: `mix-2-${Date.now()}`,
        nome: `Mix 2 Pizzas — ${pA.nome} + ${pB.nome} (${tamanhoVal})`,
        descricao: "Junta duas pizzas à tua escolha para máximo sabor!",
        preco: precoArredondado,
        imagem: "/pizza2mix.png", // força a imagem da public
        estaDisponivel: true,
        quantidade: 1,
        meta: {
          tipo: "mix-2",
          pizzaA: String(pA._id),
          pizzaB: String(pB._id),
          tamanho: tamanhoVal,
        },
      };

      adicionarAoCarrinho(pA, { tipo: "mix-2", pizzaA: pA._id, pizzaB: pB._id, tamanho: tamanhoVal }, 1);
      
      toast.success("Mix 2 Pizzas adicionado ao carrinho!");
      closeModal();
    } catch (err) {
      console.error("Erro em handleAddMixToCart:", err);
      toast.error("Erro interno ao adicionar Mix. Verifica a consola.");
    }
  };




  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h1
          className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {categoria?.charAt(0).toUpperCase() + categoria?.slice(1)}
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {products?.length === 0 && (
            <h2 className="text-3xl font-semibold text-gray-300 text-center col-span-full">
              Nenhum produto encontrado nesta categoria
            </h2>
          )}

          {/*Cartões fixos: apenas na categoria "pizzas"*/}
          {categoria?.toLowerCase() === "pizzas" && (
            <>
              {/*Make Your Own Pizza — mantém o comportamento "especial" (botão Personalizar)*/}
              <CartaoProduto
                key="make-your-own"
                product={{
                  _id: "make-your-own",
                  nome: "Make Your Own Pizza 🍕",
                  preco: 0,
                  imagem: "/makeYourOwn.png",
                  descricao: "Escolhe massa, molho e ingredientes para criar a tua pizza!",
                  estaDisponivel: true,
                  ingredientes: [],
                }}
                especial
              />

              {/*Mix 2 Pizzas — "especial" com descrição e abre modal*/}
              <CartaoProduto
                key="mix-2-pizzas"
                product={{
                  _id: "mix-2-pizzas",
                  nome: "Mix 2 Pizzas 🍕🍕",
                  preco: 0,
                  imagem: "/pizza2mix.png",
                  descricao: "Junta duas pizzas à tua escolha para máximo sabor!",
                  estaDisponivel: true,
                  ingredientes: [],
                }}
                especial
                onPersonalizar={() => setModalOpen(true)}
                especialLabel="Escolher Pizzas  🍕🍕"
              />
            </>
          )}

          {products?.map((product) => (
            <CartaoProduto key={product._id} product={product} />
          ))}
        </motion.div>
      </div>

      {/*Modal Mix 2 Pizzas*/}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/*overlay*/}
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-2xl bg-gray-900/80 backdrop-blur rounded-xl border border-gray-700 p-6"
          >
            <h3 className="text-xl font-semibold text-emerald-300 mb-4">Mix 2 Pizzas — Escolher</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Primeira Pizza</label>
                {OptionDropdown ? (
                  <OptionDropdown options={pizzaOptions} value={pizzaA} onChange={setPizzaA} placeholder="Escolher Primeira Pizza" />
                ) : (
                  <select className="w-full p-2 rounded bg-gray-800 text-white" value={pizzaA || ""} onChange={(e) => setPizzaA(e.target.value)}>
                    <option value="">Escolher Primeira Pizza</option>
                    {pizzaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1 block">Segunda Pizza</label>
                {OptionDropdown ? (
                  <OptionDropdown options={pizzaOptions} value={pizzaB} onChange={setPizzaB} placeholder="Escolher Segunda Pizza" />
                ) : (
                  <select className="w-full p-2 rounded bg-gray-800 text-white" value={pizzaB || ""} onChange={(e) => setPizzaB(e.target.value)}>
                    <option value="">Escolher Segunda Pizza</option>
                    {pizzaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-300 mb-1 block">Tamanho</label>
              {OptionDropdown ? (
                <OptionDropdown options={TAMANHOS} value={tamanho} onChange={setTamanho} placeholder="Escolher tamanho" />
              ) : (
                <select className="w-full p-2 rounded bg-gray-800 text-white" value={tamanho || ""} onChange={(e) => setTamanho(e.target.value)}>
                  <option value="">Escolher tamanho</option>
                  {TAMANHOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={closeModal} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white">
                Anular
              </button>
              <button onClick={handleAddMixToCart} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white">
                Adicionar ao carrinho
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CategoriaPage;
