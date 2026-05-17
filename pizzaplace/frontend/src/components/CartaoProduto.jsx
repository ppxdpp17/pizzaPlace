// imports no topo permanecem os mesmos
import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TAMANHOS = [
  { value: "pequena", label: "Pequena" },
  { value: "media", label: "Média" },
  { value: "grande", label: "Grande" },
];

const CartaoProduto = ({
  product,
  produto,
  especial = false,
  hideActions = false,
  hidePrice = false,
  animate = true,
  onPersonalizar,
  especialLabel = "Personalizar 🍕",
  compactMobile = false,
}) => {
  const p = product ?? produto ?? {};
  const { user } = useUserStore();
  const { adicionarAoCarrinho } = useCarrinhoStore(); // novo método
  const navigate = useNavigate();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Novo estado para modal de seleção de tamanho
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  const gerirAdicionarCarrinho = () => {
    if (!user) {
      toast.error("Por favor, faça login para adicionar produtos ao carrinho.", { id: "login" });
      setShowLoginPrompt(true);
      return;
    }

    // Se o produto pertencer a pizzas ou bebidas, abrir o modal de escolha
    const categoria = (p.categoria || "").toLowerCase();
    if (categoria === "pizzas" || categoria === "bebidas") {
      setSelectedSize(null);
      setSizeModalOpen(true);
      return;
    }

    // Caso contrário, adicionar normalmente (backed server)
    adicionarAoCarrinho(p);
    // toast success é tratado no store, mas podes repetir:
    // toast.success("Produto adicionado ao carrinho!");
  };

  const confirmarTamanho = () => {
    if (!selectedSize) {
      toast.error("Por favor, escolha um tamanho.");
      return;
    }
    // usar o novo método local que adiciona item com tamanho e preço ajustado
    adicionarAoCarrinho(p, { tamanho: selectedSize }, 1);
    setSizeModalOpen(false);
  };

  // ... restante do CartaoProduto (ingredientes, root JSX) permanece igual,
  // exceto por incluirmos o markup do modal abaixo do root

  const root = (
    <div className={`flex relative flex-col overflow-hidden rounded-lg border border-red-100 shadow-lg bg-[#fdf4e5] ${compactMobile ? "w-60 h-[24rem] sm:w-72 sm:h-[28rem]" : "w-72 h-[28rem]"}`}>
      <div className={`relative mx-3 mt-3 flex overflow-hidden rounded-xl ${compactMobile ? "h-36 sm:h-60" : "h-60"}`}>
        <img className="object-cover w-full" src={p.imagem || "/placeholder.png"} alt={p.nome || "Produto"} />
        <div className="absolute inset-0 bg-black bg-opacity-0" />
      </div>

      <div className="mt-4 px-5 pb-5 flex-1 flex flex-col">
        <h5 className={`font-semibold tracking-tight text-gray-800 ${compactMobile ? "text-lg sm:text-xl mb-1 sm:mb-0" : "text-xl"}`}>{p.nome ?? "Produto"}</h5>

        {especial ? (
          <p className="text-sm text-gray-600">{p.descricao ?? "Personalize a sua pizza escolhendo massa, molho e toppings."}</p>
        ) : (
          (Array.isArray(p.ingredientes) && p.ingredientes.length > 0) ? (
            <p className="text-sm text-gray-600">{p.ingredientes.map(i => typeof i === "string" ? i : `${i.icone ? i.icone + " " : ""}${i.nome}`).join(", ")}</p>
          ) : null
        )}

        {!hidePrice && (
          <div className={`mt-2 flex items-center justify-between ${compactMobile ? "mb-3 sm:mb-5" : "mb-5"}`}>
            <p>
              {!especial && typeof p.preco === "number" && p.preco > 0 ? (
                <span className={`font-bold text-orange-500 ${compactMobile ? "text-2xl sm:text-3xl" : "text-3xl"}`}>
                  {(p.categoria === "pizzas" || p.categoria === "bebidas") && <span className={`font-normal text-gray-500 mr-1 ${compactMobile ? "text-sm sm:text-lg" : "text-lg"}`}>desde</span>}
                  €{p.preco.toFixed(2)}
                </span>
              ) : (
                especial ? null : (p.preco === 0 ? <span className="text-sm text-gray-500">Grátis</span> : null)
              )}
            </p>
          </div>
        )}

        {showLoginPrompt && !user && (
          <div className="mb-3 rounded-md bg-yellow-50 px-4 py-2 text-yellow-800 text-sm border border-yellow-200">
            Por favor, faça login para adicionar produtos ao carrinho.
            <button
              onClick={() => {
                setShowLoginPrompt(false);
                navigate("/login");
              }}
              className="ml-3 underline text-yellow-900"
            >
              Fazer login
            </button>
          </div>
        )}

        <div className="mt-auto">
          {!hideActions && (
            <>
              {especial ? (
                <button
                  onClick={() => {
                    if (typeof onPersonalizar === "function") {
                      onPersonalizar();
                    } else {
                      navigate("/pizza/customizar");
                    }
                  }}
                  className={`flex items-center justify-center rounded-lg bg-orange-500 text-center font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 ${compactMobile ? "px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm" : "px-5 py-2.5 text-sm"}`}
                >
                  {especialLabel}
                </button>
              ) : (
                <button
                  className={`flex items-center justify-center rounded-lg bg-orange-500 text-center font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 ${compactMobile ? "px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm" : "px-5 py-2.5 text-sm"}`}
                  onClick={gerirAdicionarCarrinho}
                  disabled={!p || !p._id}
                >
                  <ShoppingCart size={compactMobile ? 18 : 22} className={`mr-2 ${compactMobile ? "sm:w-6 sm:h-6" : ""}`} />
                  Adicionar ao carrinho
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!animate) return (
    <>
      {root}
      {/* modal */}
      {sizeModalOpen && (
        <SizeModal
          onClose={() => setSizeModalOpen(false)}
          selectedSize={selectedSize}
          onSelect={setSelectedSize}
          onConfirm={confirmarTamanho}
        />
      )}
    </>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
        {root}
      </motion.div>

      {/* Modal de tamanhos */}
      {sizeModalOpen && (
        <SizeModal
          onClose={() => setSizeModalOpen(false)}
          selectedSize={selectedSize}
          onSelect={setSelectedSize}
          onConfirm={confirmarTamanho}
        />
      )}
    </>
  );
};

export default CartaoProduto;

/* Componente interno para o modal de seleção de tamanho */
const SizeModal = ({ onClose, selectedSize, onSelect, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="relative z-10 w-full max-w-md bg-white rounded-xl border border-red-100 shadow-xl p-6"
      >
        <h3 className="text-lg font-semibold text-orange-500 mb-3">Escolha o Tamanho</h3>

        <div className="space-y-3">
          {TAMANHOS.map(t => (
            <label key={t.value} className={`flex items-center justify-between p-3 rounded-md cursor-pointer border ${selectedSize === t.value ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}>
              <div>
                <div className="text-sm font-medium text-gray-800">{t.label}</div>
              </div>
              <input
                type="radio"
                name="tamanho"
                value={t.value}
                checked={selectedSize === t.value}
                onChange={() => onSelect(t.value)}
                className="h-4 w-4 accent-orange-500"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white">Adicionar</button>
        </div>
      </motion.div>
    </div>
  );
};
