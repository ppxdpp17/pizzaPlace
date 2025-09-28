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
    <div className="flex w-72 h-[28rem] relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg bg-gray-800">
      <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
        <img className="object-cover w-full" src={p.imagem || "/placeholder.png"} alt={p.nome || "Produto"} />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      <div className="mt-4 px-5 pb-5 flex-1 flex flex-col">
        <h5 className="text-xl font-semibold tracking-tight text-white">{p.nome ?? "Produto"}</h5>

        {especial ? (
          <p className="text-sm text-gray-300">{p.descricao ?? "Personalize a sua pizza escolhendo massa, molho e toppings."}</p>
        ) : (
          (Array.isArray(p.ingredientes) && p.ingredientes.length > 0) ? (
            <p className="text-sm text-gray-300">{p.ingredientes.map(i => typeof i === "string" ? i : `${i.icone ? i.icone + " " : ""}${i.nome}`).join(", ")}</p>
          ) : null
        )}

        {!hidePrice && (
          <div className="mt-2 mb-5 flex items-center justify-between">
            <p>
              {!especial && typeof p.preco === "number" && p.preco > 0 ? (
                <span className="text-3xl font-bold text-emerald-400">€{p.preco.toFixed(2)}</span>
              ) : (
                especial ? null : (p.preco === 0 ? <span className="text-sm text-gray-400">Grátis</span> : null)
              )}
            </p>
          </div>
        )}

        {showLoginPrompt && !user && (
          <div className="mb-3 rounded-md bg-yellow-900/60 px-4 py-2 text-yellow-100 text-sm">
            Por favor, faça login para adicionar produtos ao carrinho.
            <button
              onClick={() => {
                setShowLoginPrompt(false);
                navigate("/login");
              }}
              className="ml-3 underline text-yellow-200"
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
                className="flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-300"
              >
                {especialLabel}
              </button>
            ) : (
              <button
                className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                onClick={gerirAdicionarCarrinho}
                disabled={!p || !p._id}
              >
                <ShoppingCart size={22} className="mr-2" />
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
        className="relative z-10 w-full max-w-md bg-gray-900/90 rounded-xl border border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-emerald-300 mb-3">Escolha o Tamanho</h3>

        <div className="space-y-3">
          {TAMANHOS.map(t => (
            <label key={t.value} className={`flex items-center justify-between p-3 rounded-md cursor-pointer border ${selectedSize === t.value ? "border-emerald-400 bg-gray-800" : "border-gray-700"}`}>
              <div>
                <div className="text-sm font-medium text-white">{t.label}</div>
              </div>
              <input
                type="radio"
                name="tamanho"
                value={t.value}
                checked={selectedSize === t.value}
                onChange={() => onSelect(t.value)}
                className="h-4 w-4"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white">Adicionar</button>
        </div>
      </motion.div>
    </div>
  );
};
