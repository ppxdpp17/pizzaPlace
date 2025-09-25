import { motion } from "framer-motion";
import { Trash, CheckCircle, Circle, Edit2 } from "lucide-react";  
import { useProductStore } from "../stores/useProductStore";
import { useNavigate } from "react-router-dom";


const ListaProdutos = () => {
  const { apagarProduto, disponibilizarProduto, products } = useProductStore();
  const navigate = useNavigate();

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Produto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Preço</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoria</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Disponibilidade</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>

        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {products?.map((product) => (
            <tr key={product._id} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={product.imagem}
                      alt={product.nome}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">{product.nome}</div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">€{product.preco.toFixed(2)}</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-300">{product.categoria}</div>
              </td>

              {/* Disponibilidade */}
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => disponibilizarProduto(product._id)}
                  className="p-1 rounded-full transition-colors duration-200"
                >
                  {product.estaDisponivel ? (
                    <CheckCircle className="h-6 w-6 text-green-500" /> //Disponível
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" /> //Indisponível
                  )}
                </button>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                <button
                  onClick={() => navigate(`/admin/produtos/${product._id}/editar`)}
                  className="text-emerald-400 hover:text-emerald-300"
                  title="Editar produto"
                >
                  <Edit2 className="h-5 w-5" />
                </button>

                <button
                  onClick={() => apagarProduto(product._id)}
                  className="text-red-400 hover:text-red-300"
                  title="Apagar produto"
                >
                  <Trash className="h-5 w-5" />
                </button>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default ListaProdutos;
