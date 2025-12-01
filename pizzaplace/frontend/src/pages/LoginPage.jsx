import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../stores/useAuthStore.js";
import { useUserStore } from "../stores/useUserStore.js";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error } = useAuthStore();
  const { verificarAutenticacao } = useUserStore();
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
    await verificarAutenticacao();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2 xl shadow-xl overflow-hidden'
      >
        <div className='p-8'>
          <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text'>
            Bem-Vindo
          </h2>

          <form onSubmit={handleLogin}>
            <Input
              icon={Mail}
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              icon={Lock}
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className='flex justify-center mb-6'>
              <Link to='/esqueceu-password' className='text-sm text-orange-400 hover:underline'>
                Esqueceu-se da Password?
              </Link>
            </div>
            {error && <p className='text-center text-red-500 font-semibold mb-2'>{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:from-red-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? <Loader className='w-6 h-6 animate-spin  mx-auto' /> : "Login"}
            </motion.button>
          </form>
        </div>
        <div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
          <p className='text-sm text-gray-400'>
            Não tem uma conta?{" "}
            <Link to='/signup' className='text-orange-400 hover:underline'>
              Criar conta
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginPage;