import { useState } from "react";
import { motion } from "framer-motion";

export default function MoradaForm({ isOpen, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    postal_code: "",
    country: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-2xl p-6 space-y-4 max-w-md w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h3 className="text-lg font-semibold text-white text-center">
          Preencha com os dados da sua morada
        </h3>
        {["name","line1","line2","city","postal_code","country"].map((field) => (
          <input
            key={field}
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.replace("_"," ").toUpperCase()}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required={field !== "line2"}
          />
        ))}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700"
          >
            Confirmar
          </button>
        </div>
      </motion.form>
    </div>
  );
}
