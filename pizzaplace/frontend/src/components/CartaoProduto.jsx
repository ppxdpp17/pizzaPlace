import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useNavigate } from "react-router-dom";

const CartaoProduto = ({ product, especial = false }) => {
  const { user } = useUserStore();
  const { adicionarAoCarrinho } = useCarrinhoStore();
  const navigate = useNavigate();

  const gerirAdicionarCarrinho = () => {
    if (!user) {
      toast.error("Por favor, faça login para adicionar produtos ao carrinho.", { id: "login" });
      return;
    }
    adicionarAoCarrinho(product);
  };

  // Ingredientes: construir string apenas se existirem objetos úteis
  let ingredientesTexto = "";
  if (Array.isArray(product.ingredientes) && product.ingredientes.length > 0) {
    const partes = product.ingredientes
      .map((i) => {
        if (typeof i === "string") return i;
        return `${i.icone ? i.icone + " " : ""}${i.nome}`;
      })
      .filter(Boolean);
    ingredientesTexto = partes.join(", ");
  }

  // Preço seguro (evitar crash se product.preco undefined)
  const precoNumero = typeof product.preco === "number" ? product.preco : (Number(product.preco) || 0);

  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg bg-gray-800">
      <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
        <img
          className="object-cover w-full"
          src={product.imagem}
          alt={product.nome || "Produto"}
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      <div className="mt-4 px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-white">
          {product.nome}
        </h5>

        {/*Mostrar descrição ou ingredientes, consoante o cartão*/}
        {especial ? (
          <p className="text-sm text-gray-300">
            {product.descricao || "Personalize a sua pizza escolhendo massa, molho e toppings."}
          </p>
        ) : (
          //Só mostrar ingredientes se houver texto útil
          ingredientesTexto ? (
            <p className="text-sm text-gray-300">{ingredientesTexto}</p>
          ) : null
        )}

        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            {/*Esconder o preço se for o cartão especial ou se o preço for 0*/}
            {!especial && precoNumero > 0 ? (
              <span className="text-3xl font-bold text-emerald-400">€{precoNumero.toFixed(2)}</span>
            ) : (
              //Se quiseres mostrar "A partir de ..." podes colocar aqui
              especial ? null : <span className="text-sm text-gray-400">Grátis</span>
            )}
          </p>
        </div>

        {/*Botões: Personalizar para especial, caso contrário Adicionar*/}
        {especial ? (
          <button
            onClick={() => navigate("/pizza/customizar")}
            className="flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm
              font-medium text-white hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            Personalizar 🍕
          </button>
        ) : (
          <button
            className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm
                font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            onClick={gerirAdicionarCarrinho}
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
