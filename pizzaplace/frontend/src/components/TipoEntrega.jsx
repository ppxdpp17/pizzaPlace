import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Utensils, Bike, CreditCard, Coins } from "lucide-react";
import LocationDropdown from "./LocationDropdown";

export default function TipoEntrega({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  const [deliveryType, setDeliveryType] = useState(null);
  const [paymentMoment, setPaymentMoment] = useState(null);
  const [paymentType, setPaymentType] = useState(null);
  const [pedidoLocation, setPedidoLocation] = useState("");

  // O useEffect dispara quando os 3 estados finais estão preenchidos
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
      setPaymentMoment(null);
      setPaymentType(null);
      setPedidoLocation("");
    }
  }, [deliveryType, paymentType, pedidoLocation, onSelect]);

  // Se escolhe pagar online, define logo o tipo como stripe e avança
  const handlePaymentMoment = (moment) => {
    setPaymentMoment(moment);
    if (moment === "online") {
        setPaymentType("stripe");
    } else {
        setPaymentType(null); // Reseta para forçar a escolha da sub-opção
    }
  };

  const paymentDisabled = !pedidoLocation; // Bloqueia pagamento se não houver loja selecionada

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] backdrop-blur-sm">
      <motion.div
        className="bg-white rounded-2xl p-6 space-y-5 max-w-sm w-full shadow-2xl border border-gray-100"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* 1. LOCALIZAÇÃO */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Localização / Loja <span className="text-red-500">*</span></label>
          <div className="text-gray-900 border-gray-300">
            <LocationDropdown value={pedidoLocation} onChange={setPedidoLocation} />
          </div>
        </div>

        {/* 2. TIPO DE ENTREGA */}
        <h3 className="text-lg font-bold text-gray-900 text-center border-t border-gray-100 pt-4">Forma de entrega</h3>
        <div className="flex justify-between gap-4">
          <button
            type="button"
            onClick={() => setDeliveryType("takeaway")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${deliveryType === "takeaway" ? "bg-red-50 border-red-500 text-red-600 shadow-sm" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}
          >
            <Utensils size={32} className="mb-2" />
            <span className="text-sm font-medium">Take-Away</span>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryType("delivery")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${deliveryType === "delivery" ? "bg-red-50 border-red-500 text-red-600 shadow-sm" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}
          >
            <Bike size={32} className="mb-2" />
            <span className="text-sm font-medium">Entrega</span>
          </button>
        </div>

        {/* 3. PAGAMENTO */}
        <h3 className="text-lg font-bold text-gray-900 text-center border-t border-gray-100 pt-4">Momento do Pagamento</h3>
        <div className="flex justify-between gap-4">
          <button
            type="button"
            disabled={paymentDisabled}
            onClick={() => handlePaymentMoment("online")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${paymentDisabled ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-transparent" : (paymentMoment === "online" ? "bg-red-50 border-red-500 text-red-600 shadow-sm" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100")
              }`}
          >
            <CreditCard size={32} className="mb-2" />
            <span className="text-sm font-medium">Pagar Online</span>
            <span className="text-[10px] text-gray-500 mt-1">Cartão, MBWay, Apple Pay</span>
          </button>

          <button
            type="button"
            disabled={paymentDisabled}
            onClick={() => handlePaymentMoment("local")}
            className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${paymentDisabled ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-transparent" : (paymentMoment === "local" ? "bg-red-50 border-red-500 text-red-600 shadow-sm" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100")
              }`}
          >
            <Coins size={32} className="mb-2" />
            <span className="text-sm font-medium text-center">No Ato de Entrega</span>
            <span className="text-[10px] text-gray-500 mt-1">Dinheiro ou Cartão</span>
          </button>
        </div>

        {paymentMoment === "local" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4"
            >
                <h4 className="text-sm font-bold text-gray-700 text-center mb-3">Como vai pagar?</h4>
                <div className="flex justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentType("dinheiro")}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${paymentType === "dinheiro" ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    <Coins size={20} />
                    <span className="text-sm font-medium">Em Dinheiro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType("cartao")}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${paymentType === "cartao" ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    <CreditCard size={20} />
                    <span className="text-sm font-medium">Cartão</span>
                  </button>
                </div>
            </motion.div>
        )}

        {!pedidoLocation && (
          <p className="text-xs font-medium text-center text-orange-500 bg-orange-50 p-2 rounded-md">Selecione a loja primeiro.</p>
        )}

        <button onClick={onClose} className="w-full mt-4 py-2 text-center text-red-500 font-bold hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
          Cancelar
        </button>
      </motion.div>
    </div>,
    document.body
  );
}