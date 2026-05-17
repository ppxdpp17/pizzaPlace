import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import axios from "../lib/axios";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/piuzz.png')" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden mx-4"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Big Bob's Logo" className="h-20 w-auto rounded-full shadow-md" />
          </div>
          <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-700 pb-1">
            Recuperar Password
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="bg-gray-50 p-1 rounded-xl mb-4">
              <Input
                icon={Mail}
                type="email"
                placeholder="Insira o seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {message && <p className="text-sm font-medium text-center mt-2 text-green-600 bg-green-50 rounded-lg py-2">{message}</p>}
            {error && <p className="text-sm font-medium text-center mt-2 text-red-500 bg-red-50 rounded-lg py-2">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 mt-4 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Enviar link de reposição"}
            </motion.button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          <Link to="/login" className="text-red-500 hover:text-red-700 font-medium hover:underline text-sm transition-colors">
            Voltar ao Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaginaEsqueceuPassword;
