import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import CartaoProduto from "../components/CartaoProduto";
import LoadingSpinner from "../components/LoadingSpinner";
import { useProductStore } from "../stores/useProductStore";

const CategoriaPage = () => {
  const { categoria } = useParams();

  const getProdutosCategoria = useProductStore((s) => s.getProdutosCategoria);
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const error = useProductStore((s) => s.error);

  useEffect(() => {
    if (!categoria) return;
    getProdutosCategoria(categoria);
  }, [categoria, getProdutosCategoria]);

  const produtosArray = Array.isArray(products) ? products : (products?.produtos ?? []);

  if (loading) return (<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>);
  if (error) return (<div className="min-h-screen flex items-center justify-center"><div className="text-red-400">Erro: {error}</div></div>);

  const titulo = categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : "Categoria";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h1
          className="text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {titulo}
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {produtosArray.length === 0 ? (
            <h2 className="text-3xl font-semibold text-gray-300 text-center col-span-full">
              Nenhum produto encontrado nesta categoria
            </h2>
          ) : (
            produtosArray.map((product) => (
              <CartaoProduto key={product._id || product.id} product={product} />
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoriaPage;