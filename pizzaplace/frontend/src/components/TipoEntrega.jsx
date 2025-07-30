import { motion } from "framer-motion";
import { House, Bike } from "lucide-react";

export default function TipoEntrega({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;
  return (
    // Overlay
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.div
        className="bg-gray-800 rounded-2xl p-6 space-y-4 max-w-sm w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-white text-center">
          Escolha a forma de entrega
        </h3>
        <div className="flex justify-between gap-4">
          <motion.button
            onClick={() => onSelect(false)}
            className="flex-1 flex flex-col items-center p-4 bg-gray-700 rounded-xl hover:bg-gray-600"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <House size={32} className="text-emerald-400 mb-2" />
            <span className="text-sm text-white">Take‑Away</span>
          </motion.button>
          <motion.button
            onClick={() => onSelect(true)}
            className="flex-1 flex flex-col items-center p-4 bg-gray-700 rounded-xl hover:bg-gray-600"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Bike size={32} className="text-emerald-400 mb-2" />
            <span className="text-sm text-white">Entrega em Casa</span>
          </motion.button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 block text-center text-sm text-gray-400 hover:text-gray-200"
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  );
}
