import { useEffect, useMemo, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CartaoProduto from "../components/CartaoProduto";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import OptionDropdown from "../components/OptionDropdown";
import Pagination from "../components/Pagination";

const TAMANHOS = [
  { value: "pequena", label: "Pequena" },
  { value: "media", label: "Média" },
  { value: "grande", label: "Grande" },
];

const CategoriaPage = () => {
  const { getProdutosCategoria, products, currentPage, totalPages } = useProductStore();
  const { categoria } = useParams();
  const navigate = useNavigate();

  const { adicionarAoCarrinho, adicionarAoCarrinhoCustom } = useCarrinhoStore();
  const { user } = useUserStore();

  useEffect(() => {
    getProdutosCategoria(categoria, 1, 12);
  }, [getProdutosCategoria, categoria]);

  const handlePageChange = (newPage) => {
    getProdutosCategoria(categoria, newPage, 12);
  };

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
      // soma e arredonda o preço para o inteiro mais próximo (metade de cada)
      const precoA = typeof pA.preco === "number" ? pA.preco : Number(pA.preco) || 0;
      const precoB = typeof pB.preco === "number" ? pB.preco : Number(pB.preco) || 0;
      const precoSomado = (precoA / 2) + (precoB / 2);
      const precoArredondado = Math.ceil(precoSomado);

      const mixProduct = {
        _id: `mix-2-${Date.now()}`,
        nome: `Mix 2 Pizzas — ${pA.nome} + ${pB.nome} (${tamanhoVal})`,
        descricao: "Junta duas pizzas à tua escolha para máximo sabor!",
        preco: precoArredondado,
        imagem: "/pizza2mix2.png", // fallback
        imagens: [pA.imagem || "/placeholder.png", pB.imagem || "/placeholder.png"], // <-- útil para collage
        estaDisponivel: true,
        quantidade: 1,
        meta: {
          tipo: "mix-2",
          pizzaA: String(pA._id),
          pizzaB: String(pB._id),
          tamanho: tamanhoVal,
        },
      };

      adicionarAoCarrinhoCustom(mixProduct);
      toast.success("Mix 2 Pizzas adicionada ao carrinho!")
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
          className="text-center text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-700 mb-8"
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
                  imagem: "/makeYourOwn2.png",
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
                  imagem: "/pizza2mix2.png",
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

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      {/*Modal Mix 2 Pizzas*/}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/*overlay*/}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100"
          >
            <div className="bg-red-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Mix 2 Pizzas — Escolher Pizzas</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Primeira Pizza</label>
                  {OptionDropdown ? (
                    <OptionDropdown options={pizzaOptions} value={pizzaA} onChange={setPizzaA} placeholder="Escolher Primeira Pizza" />
                  ) : (
                    <select className="w-full p-2.5 outline-none rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500 text-gray-900" value={pizzaA || ""} onChange={(e) => setPizzaA(e.target.value)}>
                      <option value="">Escolher Primeira Pizza</option>
                      {pizzaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Segunda Pizza</label>
                  {OptionDropdown ? (
                    <OptionDropdown options={pizzaOptions} value={pizzaB} onChange={setPizzaB} placeholder="Escolher Segunda Pizza" />
                  ) : (
                    <select className="w-full p-2.5 outline-none rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500 text-gray-900" value={pizzaB || ""} onChange={(e) => setPizzaB(e.target.value)}>
                      <option value="">Escolher Segunda Pizza</option>
                      {pizzaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-2 block">Tamanho da Pizza</label>
                {OptionDropdown ? (
                  <OptionDropdown options={TAMANHOS} value={tamanho} onChange={setTamanho} placeholder="Escolher tamanho" />
                ) : (
                  <select className="w-full p-2.5 outline-none rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500 text-gray-900" value={tamanho || ""} onChange={(e) => setTamanho(e.target.value)}>
                    <option value="">Escolher tamanho</option>
                    {TAMANHOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button onClick={closeModal} className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold transition-colors">
                  Cancelar
                </button>
                <button onClick={handleAddMixToCart} className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow-md transition-colors">
                  Adicionar Mix
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CategoriaPage;
