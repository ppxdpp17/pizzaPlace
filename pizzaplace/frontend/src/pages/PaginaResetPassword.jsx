import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../stores/useAuthStore.js";
import MedidorForcaPassword from "../components/MedidorForcaPassword.jsx";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/piuzz.png')" }}>
        <div className="max-w-md w-full p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl text-center border border-gray-200 mx-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-500 w-8 h-8" />
          </div>
          <p className="text-red-500 font-bold text-lg mb-2">Token inválido ou ausente.</p>
          <p className="text-gray-500 text-sm mb-6">Infelizmente este link de recuperação não funciona ou já expirou.</p>
          <Link className="bg-red-50 text-red-600 font-semibold px-6 py-2 rounded-lg hover:bg-red-100 transition-colors inline-block" to="/esqueceu-password">Pedir novo link</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (password.length < 12) {
      setError("A password deve ter pelo menos 12 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As passwords não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      //Chama a store (que faz POST para /auth/reset-password/:token)
      await resetPassword(token, password);
      setMsg("Password alterada com sucesso. A redirecionar para o login...");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      setError(err?.response?.data?.msg || err?.message || "Erro ao repor a password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/piuzz.png')" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden mx-4"
      >
        <div className="p-8">
          <div className="flex justify-center mb-4">
            <img src="/Logo-Final.png" alt="Big Bob's Logo" className="h-16 w-auto rounded-full shadow-md" />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-700 pb-1">Repor Password</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-1 rounded-xl space-y-2">
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
            </div>

            <MedidorForcaPassword password={password} />

            {msg && <p className="text-sm font-medium text-center mt-2 text-green-600 bg-green-50 rounded-lg py-2">{msg}</p>}
            {error && <p className="text-sm font-medium text-center mt-2 text-red-500 bg-red-50 rounded-lg py-2">{error}</p>}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-200"
            >
              {isLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : "Alterar password"}
            </motion.button>
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          <Link to="/login" className="text-red-500 hover:text-red-700 font-medium hover:underline text-sm transition-colors">Voltar ao Login</Link>
        </div>
      </motion.div>
    </div>
  );
}
