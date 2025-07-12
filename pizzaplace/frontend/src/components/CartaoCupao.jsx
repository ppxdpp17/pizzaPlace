import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useCarrinhoStore } from "../stores/useCarrinhoStore"

const CartaoCupao = () => {
  const [codigoInputUser, setCodigoInputUser] = useState('');
  const {cupao, cupaoAplicado, aplicarCupao, removerCupao, getMeuCupao} = useCarrinhoStore(); 

  useEffect(()=> {
    getMeuCupao();
  }, [getMeuCupao])

  useEffect(() => {
    if (cupao) setCodigoInputUser(cupao.codigo);
  }, [cupao]);

  const gerirAplicarCupao = () => {
    if(!codigoInputUser) return;
    aplicarCupao(codigoInputUser);
  }

  const gerirCupaoRemovido = async () => {
    await removerCupao();
    setCodigoInputUser('');
  }

  return (
    <motion.div className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="space-y-4">
          <div>
            <label htmlFor="cupao" className="mb-2 block text-sm font-medium text-gray-300">
              Tem algum cupão?
            </label>
            <input
              type="text"
              id="cupao"
              className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white 
                placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Insira aqui o seu cupão"
              value={codigoInputUser}
              onChange={(e) => setCodigoInputUser(e.target.value)}
              required/>
          </div>
          <motion.button type="button"
            className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium 
              text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={gerirAplicarCupao}>
                Aplicar Cupão
          </motion.button>
        </div>
        {cupao && cupaoAplicado && (
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-300">
              Cupão Aplicado
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {cupao.codigo} - {cupao.percentagemDesconto}% a menos
            </p>

            <motion.button type="button"
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white
                hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={gerirCupaoRemovido}>
                  Remover Cupão
            </motion.button>
          </div>
        )}

        {cupao && (
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-300">Cupões Disponíveis:</h3>
            <p className="mt-2 text-sm text-gray-400">
              {cupao.codigo} - {cupao.percentagemDesconto}% a menos
            </p>
          </div>
        )}
    </motion.div>
  )
}

export default CartaoCupao