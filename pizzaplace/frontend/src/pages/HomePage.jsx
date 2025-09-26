import { useEffect } from "react";
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
  fetchProdutosRecomendados({ size: 6 });
}, [fetchProdutosRecomendados]);

  return (
  <div className="relative min-h-screen text-white overflow-hidden">
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
        Explore as Nossas Categorias
      </h1>
      <p className="text-center text-xl text-gray-300 mb-12">
        Descubra as últimas trends da moda.
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
    </div>
  </div>
  )
};

export default HomePage;