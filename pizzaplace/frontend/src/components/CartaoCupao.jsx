import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useCarrinhoStore } from "../stores/useCarrinhoStore"

const CartaoCupao = () => {
  const [codigoInputUser, setCodigoInputUser] = useState('');
  const { cupao, cupaoAplicado, aplicarCupao, removerCupao, getMeuCupao } = useCarrinhoStore();

  useEffect(() => {
    getMeuCupao();
  }, [getMeuCupao])

  useEffect(() => {
    if (cupao) setCodigoInputUser(cupao.codigo);
  }, [cupao]);

  const gerirAplicarCupao = () => {
    if (!codigoInputUser) return;
    aplicarCupao(codigoInputUser);
  }

  const gerirCupaoRemovido = async () => {
    await removerCupao();
    setCodigoInputUser('');
  }

  return (
    <motion.div className="space-y-4 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-md sm:p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}>
      <div className="space-y-4">
        <div>
          <label htmlFor="cupao" className="mb-2 block text-sm font-semibold text-gray-800">
            Tem algum cupão?
          </label>
          <input
            type="text"
            id="cupao"
            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 
                placeholder-gray-400 focus:border-red-500 focus:ring-red-500 shadow-sm transition-colors"
            placeholder="Insira aqui o seu cupão"
            value={codigoInputUser}
            onChange={(e) => setCodigoInputUser(e.target.value)}
            required />
        </div>
        <motion.button type="button"
          className="flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium 
              text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={gerirAplicarCupao}>
          Aplicar Cupão
        </motion.button>
      </div>
      {cupao && cupaoAplicado && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="text-lg font-bold text-gray-900">
            Cupão Aplicado
          </h3>
          <p className="mt-1 text-sm font-medium text-gray-600">
            {cupao.codigo} - {cupao.percentagemDesconto}% a menos
          </p>

          <motion.button type="button"
            className="mt-4 flex w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600
                hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={gerirCupaoRemovido}>
            Remover Cupão
          </motion.button>
        </div>
      )}

      {cupao && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="text-lg font-bold text-gray-900">Cupões Disponíveis:</h3>
          <p className="mt-1 text-sm font-medium text-gray-600">
            {cupao.codigo} - <span className="text-green-600 font-semibold">{cupao.percentagemDesconto}% a menos</span>
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default CartaoCupao