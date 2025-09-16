// src/components/CartaoProduto.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useNavigate } from "react-router-dom";

const CartaoProduto = ({ product, produto, especial = false }) => {
  // aceitar product ou produto para compatibilidade
  const p = product ?? produto ?? {};
  const { user } = useUserStore();
  const { adicionarAoCarrinho } = useCarrinhoStore();
  const navigate = useNavigate();

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const gerirAdicionarCarrinho = () => {
    if (!user) {
      // mostra toast e banner inline
      toast.error("Por favor, faça login para adicionar produtos ao carrinho.", { id: "login" });
      setShowLoginPrompt(true);
      return;
    }

    // se for um produto custom (sem _id) assumimos store lida com isso
    adicionarAoCarrinho(p);
    toast.success("Produto adicionado ao carrinho!");
  };

  // ingredientes: só mostrar se houver conteúdo útil
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
  const imagemSrc = p.imagem || "/make-your-own.png" || "/placeholder.png";

  return (
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

        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            {!especial && precoNumero !== undefined && precoNumero > 0 ? (
              <span className="text-3xl font-bold text-emerald-400">€{precoNumero.toFixed(2)}</span>
            ) : (
              especial ? null : (precoNumero === 0 ? <span className="text-sm text-gray-400">Grátis</span> : null)
            )}
          </p>
        </div>

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

        {especial ? (
          <button
            onClick={() => navigate("/pizza/customizar")}
            className="flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Personalizar 🍕
          </button>
        ) : (
          <button
            className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            onClick={gerirAdicionarCarrinho}
            disabled={!p} // evita clique em produto inválido
          >
            <ShoppingCart size={22} className="mr-2" />
            Adicionar ao carrinho
          </button>
        )}
      </div>
    </div>
  );
};

export default CartaoProduto;
