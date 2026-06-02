import { useCarrinhoStore } from "../stores/useCarrinhoStore.js";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import Recomendacoes from "../components/Recomendacoes.jsx";
import CarrinhoItem from "../components/CarrinhoItem.jsx";
import SumarioPedido from "../components/SumarioPedido.jsx";
import CartaoCupao from "../components/CartaoCupao.jsx";

const CarrinhoPage = () => {
  const { carrinho } = useCarrinhoStore();

  return (
    <div className="pb-8 pt-28 md:pb-16 md:pt-36 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed bg-gray-50 -mt-20" style={{ backgroundImage: "url('/piuzz.png')" }}>
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <motion.div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            {carrinho.length === 0 ? (
              <CarrinhoVazioUI />
            ) : (
              <div className="space-y-6">
                {carrinho.map((item) => (
                  <CarrinhoItem key={item._id} item={item} />
                ))}
              </div>
            )}
            {carrinho.length > 0 && (
              <Recomendacoes
                excludeIds={carrinho.map(i => i._id).filter(id => /^[a-fA-F0-9]{24}$/.test(id))}
                size={3}
              />
            )}
          </motion.div>
          {carrinho.length > 0 && (
            <motion.div
              className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}>
              <SumarioPedido />
              <CartaoCupao />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CarrinhoPage


const CarrinhoVazioUI = () => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-16 bg-white/95 rounded-xl shadow-md border border-gray-100 max-w-xl mx-auto backdrop-blur-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}>
    <ShoppingCart className="h-24 w-24 text-gray-400" />
    <h3 className="text-2xl font-semibold text-gray-900">O seu carrinho está vazio</h3>
    <p className="text-gray-600">Parece que ainda não adicionou nada ao seu carrinho</p>
    <Link className="mt-6 rounded-md bg-red-600 px-8 py-3 text-white font-medium transition-colors
        hover:bg-red-700 shadow-sm" to="/">
      Começar a comprar
    </Link>
  </motion.div>
);