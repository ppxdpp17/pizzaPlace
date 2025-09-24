// src/pages/CategoriaPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import CartaoProduto from "../components/CartaoProduto";
import OptionDropdown from "../components/OptionDropdown";
import toast from "react-hot-toast";

const TAMANHOS = [
  { id: "small", label: "Pequena", multiplier: 1 },
  { id: "medium", label: "Média", multiplier: 1.3 },
  { id: "large", label: "Grande", multiplier: 1.6 },
];

const CategoriaPage = () => {
  const { getProdutosCategoria, products } = useProductStore();
  const { adicionarAoCarrinhoCustom } = useCarrinhoStore();
  const { categoria } = useParams();

  useEffect(() => {
    getProdutosCategoria(categoria);
  }, [getProdutosCategoria, categoria]);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [pizzaA, setPizzaA] = useState("");
  const [pizzaB, setPizzaB] = useState("");
  const [tamanho, setTamanho] = useState(TAMANHOS[1].id);

  // Build options for the dropdowns from products (map to { id, label })
  const pizzaOptions = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.map((p) => ({ id: p._id, label: p.nome }));
  }, [products]);

  // helper to find product by id
  const findProduct = (id) => products?.find((p) => String(p._id) === String(id));

  const openModal = () => {
    setPizzaA("");
    setPizzaB("");
    setTamanho(TAMANHOS[1].id);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleAddMixToCart = () => {
    if (!pizzaA || !pizzaB) {
      toast.error("Por favor selecione duas pizzas diferentes.");
      return;
    }
    if (pizzaA === pizzaB) {
      toast.error("Escolha duas pizzas diferentes.");
      return;
    }

    const pA = findProduct(pizzaA);
    const pB = findProduct(pizzaB);

    if (!pA || !pB) {
      toast.error("Não foi possível encontrar as pizzas selecionadas.");
      return;
    }

    // calcular preço: soma (podes ajustar regras)
    const precoA = Number(pA.preco) || 0;
    const precoB = Number(pB.preco) || 0;
    // aplicar multiplicador do tamanho (média por defeito)
    const mult = TAMANHOS.find((t) => t.id === tamanho)?.multiplier ?? 1;
    const preco = +((precoA + precoB) * mult).toFixed(2);

    // ingredients combinados (sem duplicados)
    const ingsA = Array.isArray(pA.ingredientes)
      ? pA.ingredientes.map((i) => (typeof i === "string" ? i : i._id ?? i.id ?? i))
      : [];
    const ingsB = Array.isArray(pB.ingredientes)
      ? pB.ingredientes.map((i) => (typeof i === "string" ? i : i._id ?? i.id ?? i))
      : [];
    const uniqueIngIds = Array.from(new Set([...ingsA, ...ingsB]));

    const combinedIngredients = uniqueIngIds.map((id) => {
      // tentar mapear à estrutura {_id, nome, icone} se existir nos produtos carregados
      const found = (pA.ingredientes || []).concat(pB.ingredientes || []).find((i) => String(i._id ?? i.id) === String(id));
      if (!found) return { _id: id, nome: "" };
      return { _id: found._id ?? found.id, nome: found.nome ?? "", icone: found.icone ?? "" };
    });

    const mixProduct = {
      _id: `mix-${Date.now()}`,
      nome: `Mix: ${pA.nome} + ${pB.nome} (${tamanho})`,
      descricao: `${pA.nome} + ${pB.nome} — Tamanho: ${tamanho}`,
      preco,
      imagem: pA.imagem || pB.imagem || "/makeYourOwn.png",
      categoria: "pizzas",
      estaDisponivel: true,
      ingredientes: combinedIngredients,
      isCustom: true,
      meta: { pizzaA: pA._id, pizzaB: pB._id, tamanho },
    };

    adicionarAoCarrinhoCustom(mixProduct);
    toast.success("Mix adicionado ao carrinho!");
    closeModal();
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

          {/* Cartões fixos: apenas na categoria "pizzas" */}
          {categoria?.toLowerCase() === "pizzas" && (
            <>
              {/* Make Your Own Pizza */}
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

              {/*Mix 2 Pizzas*/}
              <CartaoProduto
              key="mix-2-pizzas"
              product={{
                _id: "mix-2-pizzas",
                nome: "Mix 2 Pizzas 🍕🍕",
                preco: 0,
                imagem: "/pizza2mix.png",
                descricao: "Junta duas pizzas à tua escolha para máximo sabor",
                estaDisponivel: true,
                ingredientes: [],
              }}
              ctaLabel="Escolher Pizzas"
              onCta={openModal}
            />

            </>
          )}

          {products?.map((product) => (
            <CartaoProduto key={product._id} product={product} />
          ))}
        </motion.div>
      </div>

      {/* Modal (simples) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
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
                <label className="text-sm text-gray-300 mb-1 block">Pizza A</label>
                <OptionDropdown options={pizzaOptions} value={pizzaA} onChange={setPizzaA} placeholder="Escolher Pizza A" />
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-1 block">Pizza B</label>
                <OptionDropdown options={pizzaOptions} value={pizzaB} onChange={setPizzaB} placeholder="Escolher Pizza B" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-300 mb-1 block">Tamanho</label>
              <OptionDropdown options={TAMANHOS} value={tamanho} onChange={setTamanho} placeholder="Escolher tamanho" />
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
