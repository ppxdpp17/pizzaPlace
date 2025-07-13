import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import axios from "../lib/axios"
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react"

const Estatisticas = () => {
    const [analisesEstatisticas, setAnalisesEstatisticas] = useState({
      users: 0,
      produtos: 0,
      totalVendas: 0,
      totalLucro: 0,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [dadosVendasDiarias, setDadosVendasDiarias] = useState([]);

    useEffect(() => {
      const fetchEstatisticas = async () => {
        try {
          const response = await axios.get("/analises");
          setAnalisesEstatisticas(response.data.analisesEstatisticas);
          setDadosVendasDiarias(response.data.dadosVendasDiarias);
        } catch (error) {
          console.error("Erro ao obter estatísticas:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchEstatisticas();
    }, []);
  
    if(isLoading) return <div>A carregar...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <CartaoEstatisticas
          titulo="Quantidade de Utilizadores"
          valor={analisesEstatisticas.users.toLocaleString()}
          icon={Users}
          cor="from-emerald-500 to-teal-700"/>
        <CartaoEstatisticas
          titulo="Quantidade de Produtos"
          valor={analisesEstatisticas.produtos.toLocaleString()}
          icon={Package}
          cor="from-emerald-500 to-green-700"/>
        <CartaoEstatisticas
          titulo="Quantidade de Vendas"
          valor={analisesEstatisticas.totalVendas.toLocaleString()}
          icon={ShoppingCart}
          cor="from-emerald-500 to-cyan-700"/>
        <CartaoEstatisticas
          titulo="Quantidade de Luvcro"
          valor={analisesEstatisticas.totalLucro.toLocaleString()}
          icon={DollarSign}
          cor="from-emerald-500 to-lime-700"/>
      </div>
    </div>
  )
}

export default Estatisticas

const CartaoEstatisticas = ({ titulo, valor, icon: Icon, cor }) => (
  <motion.div className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${cor}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}>
      <div className="flex justify-between items-center">
        <div className="z-10">
          <p className="text-emerald-300 text-sm mb-1 font-semibold">{titulo}</p>
          <h3 className="text-white text-3xl font-bold">{valor}</h3>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30"/>
      <div className="absolute -bottom-4 -right-4 text-emerald-800 opacity-50">
        <Icon className="w-32 h-32" />

      </div>
  </motion.div>
)