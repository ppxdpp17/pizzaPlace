import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Utensils, Bike, CreditCard, Coins } from "lucide-react";

const LOCATIONS = [
  "Bragança (Av. João da Cruz)",
  "Bragança (Shopping)",
  "Vila Real",
  "Chaves",
  "Braga"
];

export default function TipoEntrega({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  const [deliveryType, setDeliveryType] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [pedidoLocation, setPedidoLocation] = useState("");

  //Só envia quando os 3 estiverem preenchidos
  useEffect(() => {
    if (deliveryType && paymentType && pedidoLocation) {
      onSelect({ tipoEntrega: deliveryType, paymentMethod: paymentType, pedidoLocation });
      setDeliveryType(null);
      setPaymentType(null);
      setPedidoLocation("");
    }
  }, [deliveryType, paymentType, pedidoLocation, onSelect]);

  const paymentDisabled = !pedidoLocation; // true se não houver localização

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.div
        className="bg-gray-800 rounded-2xl p-6 space-y-4 max-w-sm w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Combobox para selecionar as localizações */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Localização / Loja <span className="text-red-400">*</span></label>
          <div className="relative">
            <select
              value={pedidoLocation}
              onChange={(e) => setPedidoLocation(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none"
            >
              <option value="">-- Selecionar localização (obrigatório) --</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Passo 2: escolha de entrega */}
        <h3 className="text-lg font-semibold text-white text-center">
          Escolha uma forma de entrega
        </h3>
        <div className="flex justify-between gap-4">
          <motion.button
            onClick={() => setDeliveryType("takeaway")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl hover:bg-gray-600 ${deliveryType === "takeaway" ? "bg-emerald-600" : "bg-gray-700"}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
          >
            <Utensils size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Take-Away</span>
          </motion.button>

          <motion.button
            onClick={() => setDeliveryType("delivery")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl hover:bg-gray-600 ${deliveryType === "delivery" ? "bg-emerald-600" : "bg-gray-700"}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
          >
            <Bike size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Entrega em Casa</span>
          </motion.button>
        </div>

        {/* Escolha do tipo de pagamento*/}
        <h3 className="text-lg font-semibold text-white text-center mt-4">
          Selecione um método de pagamento
        </h3>
        <div className="flex justify-between gap-4">
          <motion.button
            onClick={() => { if (!paymentDisabled) setPaymentType("dinheiro"); }}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl transition ${
              paymentDisabled ? "opacity-50 cursor-not-allowed bg-gray-600" : (paymentType === "dinheiro" ? "bg-emerald-600" : "bg-gray-700 hover:bg-gray-600")
            }`}
            whileHover={paymentDisabled ? {} : { scale: 1.03 }}
            whileTap={paymentDisabled ? {} : { scale: 0.97 }}
            type="button"
            aria-disabled={paymentDisabled}
          >
            <Coins size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Dinheiro</span>
          </motion.button>

          <motion.button
            onClick={() => { if (!paymentDisabled) setPaymentType("cartao"); }}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl transition ${
              paymentDisabled ? "opacity-50 cursor-not-allowed bg-gray-600" : (paymentType === "cartao" ? "bg-emerald-600" : "bg-gray-700 hover:bg-gray-600")
            }`}
            whileHover={paymentDisabled ? {} : { scale: 1.03 }}
            whileTap={paymentDisabled ? {} : { scale: 0.97 }}
            type="button"
            aria-disabled={paymentDisabled}
          >
            <CreditCard size={32} className="text-white mb-2" />
            <span className="text-sm text-white">Cartão</span>
          </motion.button>
        </div>

        {!pedidoLocation && (
          <div className="text-xs text-yellow-300 text-center mt-2">
            Seleccione uma localização antes de escolher o método de pagamento.
          </div>
        )}

        <button
          onClick={() => {
            setDeliveryType(null);
            setPaymentType(null);
            setPedidoLocation("");
            onClose();
          }}
          className="w-full mt-4 block text-center text-sm text-red-400 hover:text-gray-200 font-bold"
          type="button"
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  );
}
