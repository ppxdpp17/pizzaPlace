// src/pages/PaginaResetPassword.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../stores/useAuthStore.js";
import { MedidorForcaPassword } from "../components/MedidorForcaPassword.jsx";

export default function PaginaResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const resetPassword = useAuthStore(state => state.resetPassword);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-gray-800 rounded-2xl text-center">
          <p className="text-red-400">Token inválido ou ausente.</p>
          <Link className="text-green-400 mt-4 inline-block" to="/esqueceu-password">Pedir novo link</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (password.length < 6) {
      setError("A password deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As passwords não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      // chama a store (que faz POST para /auth/reset-password/:token)
      await resetPassword(token, password);
      setMsg("Password alterada com sucesso. A redirecionar para o login...");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      // a store já define mensagens, mas garantimos fallback
      setError(err?.response?.data?.msg || err?.message || "Erro ao repor a password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4 text-center text-emerald-400">Repor Password</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              icon={Lock}
              type="password"
              placeholder="Nova password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Confirmar password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <MedidorForcaPassword password={password} />

            {msg && <p className="text-sm text-center mt-2 text-emerald-300">{msg}</p>}
            {error && <p className="text-sm text-center mt-2 text-red-400">{error}</p>}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg transition"
            >
              {isLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : "Alterar password"}
            </motion.button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <Link to="/login" className="text-green-400 hover:underline text-sm">Voltar ao Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
