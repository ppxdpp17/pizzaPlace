import { ArrowRight, CheckCircle, HandHeart } from 'lucide-react'
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCarrinhoStore } from '../stores/useCarrinhoStore';
import axios from '../lib/axios';
import Confetti from 'react-confetti';

export default function PaginaSucessoCompra() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const method = searchParams.get('method');   //"dinheiro" ou undefined
  const pedidoId = searchParams.get('pedidoId'); //opcional para cash

  const [aProcessar, setEstaProcessar] = useState(true);
  const [error, setErro] = useState(null);
  const [orderNumber, setOrderNumber] = useState(pedidoId || null);

  const { limparCarrinho } = useCarrinhoStore();

  useEffect(() => {
    async function processCheckout() {
      try {
        if (method === 'dinheiro' || method === 'cartao') {
          //Pedido local (dinheiro ou TPA) já criado no processador de pagamentos locais
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
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="p-8 text-center text-gray-600 font-medium">A processar...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 relative bg-cover bg-center bg-no-repeat bg-fixed">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="text-center text-red-500 font-medium">Erro: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 bg-gray-50 min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/piuzz.png')" }}>
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-red-500 w-20 h-20 mb-4 drop-shadow-sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-700 mb-2 pb-3">
            {method === 'dinheiro' || method === 'cartao'
              ? 'O seu pedido foi efetuado!'
              : 'Compra Efetuada com Sucesso!'}
          </h1>
          <p className="text-gray-700 font-medium text-center mb-2">
            Obrigado por comprar connosco!
          </p>
          <p className="text-red-500 text-center text-sm font-medium mb-6">
            Verifique a página "Os Meus Pedidos" para detalhes e atualizações da encomenda.
          </p>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-red-100">
              <span className="text-sm font-medium text-gray-500">Pedido número:</span>
              <span className="text-sm font-bold text-red-600 bg-white px-2 py-0.5 rounded shadow-sm">
                #{orderNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Tempo estimado:</span>
              <span className="text-sm font-bold text-gray-800">
                20-30 minutos
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <Link
              to="/meus-pedidos"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg
                         transition duration-300 flex items-center justify-center shadow-md"
            >
              <HandHeart className="mr-2" size={20} />
              Os Meus Pedidos
            </Link>
            <Link
              to="/"
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-red-600 font-bold py-3 px-4 rounded-lg
                         transition duration-300 flex items-center justify-center shadow-sm"
            >
              Continuar a comprar
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
