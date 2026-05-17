import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";
import { useState } from "react";
import LogoutModal from "./LogoutModal";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.cargo === "admin";
  const { carrinho } = useCarrinhoStore();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutWithAnimation = () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    setTimeout(() => {
      logout();
      setIsLoggingOut(false);
    }, 600); // Wait for the transition to finish
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-red-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-red-600 flex items-center space-x-2">
            <img src="/logo.png" alt="Big Bob's Logo" className="h-10 w-auto rounded-full" />
            <span>Big-Boss'</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            <Link to={"/"} className="text-gray-700 hover:text-red-600 transition duration-300 ease-in-out">
              Página Inicial
            </Link>
            {user && (
              <Link to={"/meus-pedidos"} className="text-gray-700 hover:text-red-600 transition duration-300 ease-in-out">
                Os Meus Pedidos
              </Link>
            )}
            {user && (
              <Link to={"/carrinho"} className="relative group text-gray-700 hover:text-red-600 transition duration-300 ease-in-out">
                <ShoppingCart className="inline-block mr-1 group-hover:text-red-600" size={20} />
                <span className="hidden sm:inline">Carrinho</span>
                {carrinho.length > 0 && (
                  <span className="absolute -top-2 -left-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-red-500 transition duration-300 ease-in-out">
                    {carrinho.length}
                  </span>
                )}
              </Link>
            )}
            {isAdmin && (
              <Link
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center"
                to="/dashboard-secreta"
              >
                <Lock className="mr-1 inline-block" size={18} />
                <span className="hidden sm:inline">Dashboard de Administrador</span>
              </Link>
            )}

            {user ? (
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline ml-2">Sair</span>
              </button>
            ) : (
              <>
                <Link
                  to={"/signup"}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <UserPlus className="mr-2" size={18} />
                  Criar Conta
                </Link>
                <Link
                  to={"/login"}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out"
                >
                  <LogIn className="mr-2" size={18} />
                  Entrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleLogoutWithAnimation}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            className="fixed inset-0 z-[99999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;