// src/pages/PaginaEsqueceuPassword.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import axios from "../lib/axios"; // usa o axios do teu projecto

const PaginaEsqueceuPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const emailNormalized = String(email).toLowerCase().trim();
      console.log("[Esqueceu] a enviar para:", emailNormalized);

      // Se o axios tiver baseURL='/api' então isto chama /api/auth/esqueceu-password
      const res = await axios.post("/auth/esqueceu-password", { email: emailNormalized });

      console.log("[Esqueceu] resposta:", res?.data);
      setMessage(res?.data?.msg || res?.data?.message || "Se esse email existir, enviámos um link.");
    } catch (err) {
      console.error("[Esqueceu] erro:", err);
      setError(err?.response?.data?.msg || err?.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Recuperar Password
          </h2>

          <form onSubmit={handleSubmit}>
            <Input
              icon={Mail}
              type="email"
              placeholder="Insira o seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {message && <p className="text-sm text-center mt-2 text-green-300">{message}</p>}
            {error && <p className="text-sm text-center mt-2 text-red-400">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none transition duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Enviar link de reposição"}
            </motion.button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <Link to="/login" className="text-green-400 hover:underline text-sm">
            Voltar ao Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaginaEsqueceuPassword;
