import { useState, useEffect } from 'react'
import CartaoProduto from './CartaoProduto'
import axios from '../lib/axios';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';


const Recomendacoes = () => {
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRecomendacoes = async () => {
      try {
        const res = await axios.get("/produtos/recomendacoes")
        setRecomendacoes(res.data);
      } catch (error) {
        toast.error(error.response.data.msg || "Um erro ocorreu ao ir buscar produtos recomendados.");
      } finally {
        setIsLoading(false);
      } 
    };
    getRecomendacoes();
  }, []);

  if(isLoading) return <LoadingSpinner />

  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-emerald-400'>
        Produtos Recomendados
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3">
        {recomendacoes.map((product) => (
					<CartaoProduto key={product._id} product={product} />
				))}
      </div>
    </div>
  )
}

export default Recomendacoes