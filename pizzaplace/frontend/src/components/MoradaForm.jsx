import { useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function MoradaForm({ isOpen, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    postal_code: "",
    country: "Portugal"
  });

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] backdrop-blur-sm">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 space-y-5 max-w-md w-full shadow-2xl border border-gray-100"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 text-center">
          Preencha os seus dados
        </h3>
        <div className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nome"
            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-colors"
            required
          />
          <input
            name="line1"
            value={form.line1}
            onChange={handleChange}
            placeholder="Endereço, Linha 1"
            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-colors"
            required
          />
          <input
            name="line2"
            value={form.line2}
            onChange={handleChange}
            placeholder="Endereço, Linha 2 (opcional)"
            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-colors"
          />
          <div className="flex gap-3">
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Cidade"
              className="w-1/2 p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-colors"
              required
            />
            <input
              name="postal_code"
              value={form.postal_code}
              onChange={handleChange}
              placeholder="Cód. Postal"
              className="w-1/2 p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-colors"
              required
            />
          </div>
          <input
            name="country"
            value="Portugal"
            readOnly
            disabled
            className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 opacity-70 cursor-not-allowed shadow-sm"
          />
        </div>
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100 gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2.5 text-center text-red-500 font-bold hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-1/2 py-2.5 bg-red-600 rounded-lg font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </motion.form>
    </div>,
    document.body
  );
}
