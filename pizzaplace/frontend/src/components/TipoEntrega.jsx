import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Utensils, Bike, CreditCard, Coins } from "lucide-react";
import LocationDropdown from "./LocationDropdown";

export default function TipoEntrega({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  const [deliveryType, setDeliveryType] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [pedidoLocation, setPedidoLocation] = useState("");

  // O useEffect dispara quando os 3 estados estão preenchidos
  useEffect(() => {
    if (deliveryType && paymentType && pedidoLocation) {
      console.log("TipoEntrega: A enviar dados...", { deliveryType, paymentType, pedidoLocation });

      onSelect({
        tipoEntrega: deliveryType,
        paymentMethod: paymentType,
        pedidoLocation
      });

      // Resetar estados
      setDeliveryType(null);
      setPaymentType(null);
      setPedidoLocation("");
    }
  }, [deliveryType, paymentType, pedidoLocation, onSelect]);

  const paymentDisabled = !pedidoLocation; // Bloqueia pagamento se não houver loja selecionada

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.div
        className="bg-gray-800 rounded-2xl p-6 space-y-4 max-w-sm w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* 1. LOCALIZAÇÃO */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Localização / Loja <span className="text-red-400">*</span></label>
          <LocationDropdown value={pedidoLocation} onChange={setPedidoLocation} />
        </div>

        {/* 2. TIPO DE ENTREGA */}
        <h3 className="text-lg font-semibold text-white text-center">Forma de entrega</h3>
        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={() => setDeliveryType("takeaway")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl transition ${deliveryType === "takeaway" ? "bg-emerald-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            <Utensils size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Take-Away</span>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryType("delivery")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl transition ${deliveryType === "delivery" ? "bg-emerald-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            <Bike size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Entrega</span>
          </button>
        </div>

        {/* 3. PAGAMENTO */}
        <h3 className="text-lg font-semibold text-white text-center mt-4">Método de Pagamento</h3>
        <div className="flex justify-between gap-4">
          <button
            type="button"
            disabled={paymentDisabled}
            onClick={() => setPaymentType("dinheiro")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl transition ${paymentDisabled ? "opacity-50 cursor-not-allowed bg-gray-600" : (paymentType === "dinheiro" ? "bg-emerald-600" : "bg-gray-700 hover:bg-gray-600")
              }`}
          >
            <Coins size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Dinheiro</span>
          </button>

          <button
            type="button"
            disabled={paymentDisabled}
            onClick={() => setPaymentType("cartao")} // 🚨 AQUI: Garante que envia "cartao"
            className={`flex-1 flex flex-col items-center p-4 rounded-xl transition ${paymentDisabled ? "opacity-50 cursor-not-allowed bg-gray-600" : (paymentType === "cartao" ? "bg-emerald-600" : "bg-gray-700 hover:bg-gray-600")
              }`}
          >
            <CreditCard size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Cartão</span>
          </button>
        </div>

        {!pedidoLocation && (
          <p className="text-xs text-center text-yellow-500">Selecione a loja primeiro.</p>
        )}

        <button onClick={onClose} className="w-full mt-4 text-center text-red-400 font-bold hover:text-gray-200">
          Cancelar
        </button>
      </motion.div>
    </div>
  );
}