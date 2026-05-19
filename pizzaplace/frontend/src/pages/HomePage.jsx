import { useEffect } from "react";
import { motion } from "framer-motion";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import ProdutosRecomendados from "../components/ProdutosRecomendados";

const categorias = [
  { href: "/pizzas", nome: "Pizzas", imageUrl: "/pizzaICON.png" },
  { href: "/bebidas", nome: "Bebidas", imageUrl: "/drinksICON.png" },
  { href: "/entradas", nome: "Entradas & Sobremesas", imageUrl: "/sobremesaICON.png" }
]

const HomePage = () => {

  const { fetchProdutosRecomendados, products, isLoading } = useProductStore();

  useEffect(() => {
    fetchProdutosRecomendados({ size: 8 });
  }, [fetchProdutosRecomendados]);

    return (
      <div
        className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/piuzz.png')" }}
      >
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-0 pointer-events-none"></div>
        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-center text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-700 mb-4 pb-3">
            Explore as Nossas Categorias
          </h1>
          <p className="text-center text-xl sm:text-2xl font-semibold text-gray-800 mb-12 drop-shadow-sm">
            Descubra os nossos produtos deliciosos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map((categoria => (
              <CategoryItem
                categoria={categoria}
                key={categoria.nome}
              />
            )))}
          </div>
          {!isLoading && products.length > 0 && <ProdutosRecomendados produtosRecomendados={products} />}
        </motion.div>
      </div>
    )
};

export default HomePage;