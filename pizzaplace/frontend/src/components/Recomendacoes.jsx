import { useState, useEffect, useCallback } from 'react'
import CartaoProduto from './CartaoProduto'
import axios from '../lib/axios';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const Recomendacoes = ({ excludeIds = [], size = 3 }) => {
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getRecomendacoes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("size", size);
      if (excludeIds.length) params.append("excludeIds", excludeIds.join(","));
      const res = await axios.get(`/produtos/recomendacoes?${params.toString()}`);
      const produtos = res.data;
      setRecomendacoes(produtos);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Um erro ocorreu ao ir buscar produtos recomendados.");
    } finally {
      setIsLoading(false);
    }
  }, [excludeIds, size]);

  useEffect(() => {
    getRecomendacoes();

    const handler = () => {
      getRecomendacoes();
    };
    window.addEventListener("produtos:updated", handler);

    return () => {
      window.removeEventListener("produtos:updated", handler);
    };
  }, [getRecomendacoes]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-red-600'>
        Produtos Recomendados
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recomendacoes.map((product) => (
          <CartaoProduto key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default Recomendacoes;
