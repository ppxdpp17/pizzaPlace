import { motion } from "framer-motion";
import { Trash, CheckCircle, Circle, Edit2 } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useNavigate } from "react-router-dom";


const ListaProdutos = () => {
  const { apagarProduto, disponibilizarProduto, products } = useProductStore();
  const navigate = useNavigate();

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200 rounded-xl overflow-hidden max-w-4xl mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Produto</th>
              <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Disponibilidade</th>
              <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {products?.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 border border-gray-200 rounded-full overflow-hidden shadow-sm">
                      <img
                        className="h-full w-full object-cover"
                        src={product.imagem}
                        alt={product.nome}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900">{product.nome}</div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-700">€{product.preco.toFixed(2)}</div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800 capitalize">
                    {product.categoria}
                  </span>
                </td>

                {/*Disponibilidade*/}
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => disponibilizarProduto(product._id)}
                    className="p-1 rounded-full transition-colors duration-200 hover:bg-gray-100"
                  >
                    {product.estaDisponivel ? (
                      <CheckCircle className="h-6 w-6 text-green-500 drop-shadow-sm" /> //Disponível
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" /> //Indisponível
                    )}
                  </button>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3 mt-1">
                  <button
                    onClick={() => navigate(`/admin/produtos/${product._id}/editar`)}
                    className="text-orange-500 hover:text-orange-700 transition-colors"
                    title="Editar produto"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => apagarProduto(product._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Apagar produto"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ListaProdutos;
