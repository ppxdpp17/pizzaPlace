import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";

export default function LogoutModal({ onClose, onConfirm }) {
    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-2xl p-6 space-y-5 max-w-sm w-full shadow-2xl border border-gray-100 m-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <LogOut className="text-red-500 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Tem a certeza que deseja sair?
                    </h3>
                    <p className="text-gray-500 font-medium text-sm">
                        Vai ser redirecionado para a página principal.
                    </p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-1/2 py-2.5 text-center text-gray-600 font-bold hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Voltar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-1/2 py-2.5 bg-red-600 rounded-lg font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
