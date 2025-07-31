import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Utensils, Bike, CreditCard, Coins } from "lucide-react";

export default function TipoEntrega({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  const [deliveryType, setDeliveryType] = useState(null);
  const [paymentType, setPaymentType] = useState(null);

  useEffect(() => {
    if (deliveryType && paymentType) {
      onSelect({ tipoEntrega: deliveryType, paymentMethod: paymentType });
      setDeliveryType(null);
      setPaymentType(null);
    }
  }, [deliveryType, paymentType, onSelect]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.div
        className="bg-gray-800 rounded-2xl p-6 space-y-4 max-w-sm w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/*Tipo de entrega*/}
        <h3 className="text-lg font-semibold text-white text-center">
          Escolha a forma de entrega
        </h3>
        <div className="flex justify-between gap-4">
          <motion.button
            onClick={() => setDeliveryType("takeaway")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl hover:bg-gray-600 ${deliveryType === "takeaway" ? "bg-emerald-600" : "bg-gray-700"}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Utensils size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Take‑Away</span>
          </motion.button>
          <motion.button
            onClick={() => setDeliveryType("delivery")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl hover:bg-gray-600 ${deliveryType === "delivery" ? "bg-emerald-600" : "bg-gray-700"}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Bike size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Entrega em Casa</span>
          </motion.button>
        </div>

        {/*Tipo de pagamento*/}
        {deliveryType && (
          <>
            <h3 className="text-lg font-semibold text-white text-center mt-4">
              Selecione um método de pagamento
            </h3>
            <div className="flex justify-between gap-4">
              <motion.button
                onClick={() => setPaymentType("cash")}
                className={`flex-1 flex flex-col items-center p-4 rounded-xl hover:bg-gray-600 ${paymentType === "cash" ? "bg-emerald-600" : "bg-gray-700"}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Coins size={32} className="text-white mb-2" />
                <span className="text-sm text-white">Dinheiro</span>
              </motion.button>
              <motion.button
                onClick={() => setPaymentType("card")}
                className={`flex-1 flex flex-col items-center p-4 rounded-xl hover:bg-gray-600 ${paymentType === "card" ? "bg-emerald-600" : "bg-gray-700"}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <CreditCard size={32} className="text-white mb-2" />
                <span className="text-sm text-white">Cartão</span>
              </motion.button>
            </div>
          </>
        )}

        <button
          onClick={() => {
            setDeliveryType(null);
            setPaymentType(null);
            onClose();
          }}
          className="w-full mt-4 block text-center text-sm text-red-400 hover:text-gray-200 font-bold"
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  );
}