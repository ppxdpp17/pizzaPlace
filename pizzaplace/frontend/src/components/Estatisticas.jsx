import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import axios from "../lib/axios"
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingSpinner from "./LoadingSpinner";

const Estatisticas = () => {
  const [analisesEstatisticas, setAnalisesEstatisticas] = useState({
    users: 0,
    produtos: 0,
    totalVendas: 0,
    lucroTotal: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [dadosVendasDiarias, setDadosVendasDiarias] = useState([]);

  useEffect(() => {
    const fetchEstatisticas = async () => {
      try {
        const response = await axios.get("/analises");
        console.log("Analyses payload:", response.data);
        setAnalisesEstatisticas(response.data.dadosAnalise);
        setDadosVendasDiarias(response.data.dadosVendasDiarias);
      } catch (error) {
        console.error("Erro ao obter estatísticas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEstatisticas();
  }, []);

  if (isLoading) return <LoadingSpinner embedded={true} />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <CartaoEstatisticas
          titulo="Quantidade de Utilizadores"
          valor={analisesEstatisticas.users.toLocaleString()}
          icon={Users}
          cor="border-r-red-500" />
        <CartaoEstatisticas
          titulo="Quantidade de Produtos"
          valor={analisesEstatisticas.produtos.toLocaleString()}
          icon={Package}
          cor="border-r-orange-500" />
        <CartaoEstatisticas
          titulo="Quantidade de Vendas"
          valor={analisesEstatisticas.totalVendas.toLocaleString()}
          icon={ShoppingCart}
          cor="border-r-yellow-500" />
        <CartaoEstatisticas
          titulo="Quantidade de Lucro"
          valor={`€${analisesEstatisticas.lucroTotal.toLocaleString()}`}
          icon={DollarSign}
          cor="border-r-green-500" />
      </div>

      <motion.div className="bg-white/95 rounded-xl p-8 shadow-xl border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}>
        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Evolução Mensal</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dadosVendasDiarias}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="data" stroke="#6B7280" />
            <YAxis yAxisId="left" stroke="#6B7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line yAxisId="left"
              type="monotone"
              dataKey="venda"
              stroke="#EF4444"
              strokeWidth={3}
              activeDot={{ r: 8 }}
              name="Vendas" />
            <Line yAxisId="right"
              type="monotone"
              dataKey="lucro"
              stroke="#F59E0B"
              strokeWidth={3}
              activeDot={{ r: 8 }}
              name="Lucro" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div >
  )
}

export default Estatisticas

const CartaoEstatisticas = ({ titulo, valor, icon: Icon, cor }) => (
  <motion.div className={`bg-white/95 rounded-xl p-6 shadow-md border-r-4 ${cor} border-y border-l border-gray-200 overflow-hidden relative group`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}>
    <div className="flex justify-between items-center relative z-10">
      <div>
        <p className="text-gray-500 text-sm mb-1 font-bold">{titulo}</p>
        <h3 className="text-gray-900 text-3xl font-extrabold tracking-tight">{valor}</h3>
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 text-gray-100 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">
      <Icon className="w-32 h-32" />
    </div>
  </motion.div>
)