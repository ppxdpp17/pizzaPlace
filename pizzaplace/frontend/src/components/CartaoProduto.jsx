import toast from "react-hot-toast"
import { ShoppingCart } from "lucide-react"
import { useUserStore } from "../stores/useUserStore"
import { useCarrinhoStore } from "../stores/useCarrinhoStore"

const CartaoProduto = ({product}) => {

    const {user} = useUserStore();
    const {adicionarAoCarrinho} = useCarrinhoStore();

   const gerirAdicionarCarrinho = () =>{
        if(!user)
        {
            toast.error("Por favor, faça login para adicionar produtos ao carrinho.", {id: "login"});
            return;
        }
        else
        {
            adicionarAoCarrinho(product);
        }
        
   }

  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
        <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl">
            <img className="object-cover w-full" src={product.imagem} alt="Imagem do Produto"/>
            <div className="absolute inset-0 bg-black bg-opacity-20" />
        </div>

        <div className="mt-4 px-5 pb-5">
            <h5 className="text-xl font-semibold tracking-tight text-white">{product.nome}</h5>
            <div className="mt-2 mb-5 flex items-center justify-between">
                <p>
                    <span className="text-3xl font-bold text-emerald-400">€{product.preco}</span>
                </p>
            </div>
            <button
                className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm
                font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                onClick={gerirAdicionarCarrinho}>
                    <ShoppingCart size={22} className="mr-2" />
                    Adicionar ao carrinho
            </button>
        </div>
    </div>
  )
}

export default CartaoProduto