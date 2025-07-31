import { ArrowRight, CheckCircle, HandHeart } from 'lucide-react'
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCarrinhoStore } from '../stores/useCarrinhoStore';
import axios from '../lib/axios';
import Confetti from 'react-confetti';

export default function PaginaSucessoCompra() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const method    = searchParams.get('method');   //"dinheiro" ou undefined
  const pedidoId  = searchParams.get('pedidoId'); //opcional para cash

  const [aProcessar, setEstaProcessar] = useState(true);
  const [error, setErro] = useState(null);
  const [orderNumber, setOrderNumber] = useState(pedidoId || null);

  const { limparCarrinho } = useCarrinhoStore();

  useEffect(() => {
    async function processCheckout() {
      try {
        if (method === 'dinheiro') {
          //Pedido já criado no cashPayment
          setOrderNumber(Math.floor(Math.random() * 90000) + 10000);
        } else if (sessionId) {
          //Fluxo cartão: confirma no backend
          const { data } = await axios.post('/pagamentos/sucesso-checkout', {
            sessaoId: sessionId,
          });
          setOrderNumber(Math.floor(Math.random() * 90000) + 10000);
        } else {
          setErro('Nenhum ID de sessão encontrado no URL');
        }

        //Limpar carrinho em ambos os casos
        limparCarrinho();
      } catch (err) {
        console.error('Erro ao processar o pagamento', err);
        setErro(err.response?.data?.msg || 'Erro ao processar o pagamento');
      } finally {
        setEstaProcessar(false);
      }
    }

    processCheckout();
  }, [sessionId, method, pedidoId, limparCarrinho]);

  if (aProcessar) {
    return <p className="p-8 text-center">A processar...</p>;
  }
  if (error) {
    return <p className="p-8 text-center text-red-500">Erro: {error}</p>;
  }

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-emerald-400 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
            {method === 'dinheiro'
              ? 'Pagamento em Dinheiro Concluído!'
              : 'Compra Efetuada com Sucesso!'}
          </h1>
          <p className="text-gray-300 text-center mb-2">
            Obrigado por comprar conosco!
          </p>
          <p className="text-emerald-400 text-center text-sm mb-6">
            Verifique o seu email para detalhes e atualizações do pedido.
          </p>
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Pedido número:</span>
              <span className="text-sm font-semibold text-emerald-400">
                #{orderNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Tempo estimado:</span>
              <span className="text-sm font-semibold text-emerald-400">
                30-40 minutos
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg
                         transition duration-300 flex items-center justify-center"
            >
              <HandHeart className="mr-2" size={18} />
              Obrigado pela sua confiança!
            </button>
            <Link
              to="/"
              className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 rounded-lg
                         transition duration-300 flex items-center justify-center"
            >
              Continuar a comprar
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
