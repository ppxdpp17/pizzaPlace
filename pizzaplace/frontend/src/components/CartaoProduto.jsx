// src/components/CartaoProduto.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CartaoProduto = ({ product, produto, especial = false, hideActions = false, hidePrice = false, animate = true, onPersonalizar }) => {
  // aceitar product ou produto (compatibilidade)
  const p = product ?? produto ?? {};
  const { user } = useUserStore();
  const { adicionarAoCarrinho } = useCarrinhoStore();
  const navigate = useNavigate();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const gerirAdicionarCarrinho = () => {
    if (!user) {
      toast.error("Por favor, faça login para adicionar produtos ao carrinho.", { id: "login" });
      setShowLoginPrompt(true);
      return;
    }
    adicionarAoCarrinho(p);
    toast.success("Produto adicionado ao carrinho!");
  };

  // ingredientes: construir string apenas se existirem e forem úteis
  let ingredientesTexto = "";
  if (Array.isArray(p.ingredientes) && p.ingredientes.length > 0) {
    const partes = p.ingredientes
      .map((i) => {
        if (!i) return null;
        if (typeof i === "string") return i;
        return `${i.icone ? i.icone + " " : ""}${i.nome ?? ""}`.trim();
      })
      .filter(Boolean);
    ingredientesTexto = partes.join(", ");
  }

  const precoNumero = typeof p.preco === "number" ? p.preco : (p.preco !== undefined ? Number(p.preco) || 0 : undefined);
  const imagemSrc = p.imagem || "/makeYourOwnpng.png" || "/placeholder.png";

  const root = (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg bg-gray-800">
      <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
        <img className="object-cover w-full" src={imagemSrc} alt={p.nome || "Produto"} />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      <div className="mt-4 px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-white">{p.nome ?? "Produto"}</h5>

        {especial ? (
          <p className="text-sm text-gray-300">{p.descricao ?? "Personalize a sua pizza escolhendo massa, molho e toppings."}</p>
        ) : (
          ingredientesTexto ? <p className="text-sm text-gray-300">{ingredientesTexto}</p> : null
        )}

        {/* preço (respeita hidePrice) */}
        {!hidePrice && (
          <div className="mt-2 mb-5 flex items-center justify-between">
            <p>
              {!especial && precoNumero !== undefined && precoNumero > 0 ? (
                <span className="text-3xl font-bold text-emerald-400">€{precoNumero.toFixed(2)}</span>
              ) : (
                especial ? null : (precoNumero === 0 ? <span className="text-sm text-gray-400">Grátis</span> : null)
              )}
            </p>
          </div>
        )}

        {/* Banner de login (aparece quando user tenta adicionar sem estar logado) */}
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

        {/* Ações (respeita hideActions) */}
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
                Personalizar 🍕
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
  );

  // se animação desativada, apenas retorna
  if (!animate) return root;

  // caso contrário, envolve em motion com animação consistente
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
      {root}
    </motion.div>
  );
};

export default CartaoProduto;
