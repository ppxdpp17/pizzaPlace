import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import CartaoProduto from "../components/CartaoProduto";

const CategoriaPage = () => {
  const { getProdutosCategoria, products } = useProductStore();
  const { categoria } = useParams();

  useEffect(() => {
    getProdutosCategoria(categoria);
  }, [getProdutosCategoria, categoria]);

  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h1
          className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
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

          {/* Cartão fixo de pizza personalizada */}
          {categoria.toLowerCase() === "pizza" && (
            <CartaoProduto
              product={{
                _id: "make-your-own",
                nome: "Make Your Own Pizza 🍕",
                preco: 0,
                imagem: "/images/make-your-own.jpg", // mete um asset ou placeholder
                descricao:
                  "Escolhe massa, molho e ingredientes para criar a tua pizza!",
                estaDisponivel: true,
              }}
              especial
            />
          )}

          {products?.map((product) => (
            <CartaoProduto key={product._id} product={product} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoriaPage;
