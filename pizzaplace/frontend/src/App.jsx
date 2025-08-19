import { Navigate, Route, Routes } from "react-router-dom";

//Páginas
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import CategoriaPage from "./pages/CategoriaPage.jsx";
import CarrinhoPage from "./pages/CarrinhoPage.jsx";
import PaginaSucessoCompra from "./pages/PaginaSucessoCompra.jsx";
import PaginaCancelarCompra from "./pages/PaginaCancelarCompra.jsx";
import PaginaVerificarEmail from "./pages/PaginaVerificarEmail.jsx";
import MeusPedidos from "./pages/MeusPedidos.jsx";
import PaginaEsqueceuPassword from "./pages/PaginaEsqueceuPassword.jsx";
import PaginaResetPassword from "./pages/PaginaResetPassword.jsx";

//Hooks
import { useCarrinhoStore } from "./stores/useCarrinhoStore.js";

//Componentes
import Navbar from "./components/Navbar.jsx";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore.js";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { useEffect } from "react";

function App() {
  const { user, verificarAutenticacao, checkingAuth } = useUserStore();
  const { getItensCarrinho } = useCarrinhoStore();

  useEffect(() => {
    verificarAutenticacao();
  }, [verificarAutenticacao]);

  useEffect(() => {
    if(!user) return;
    
    getItensCarrinho()
  }, [getItensCarrinho, user])

  if(checkingAuth) return <LoadingSpinner/>;

  return(
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
      {/**Gradiente do Background*/}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0'>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,_rgba(0,0,0,0.1)_100%)]"
          />
        </div>
      </div>

      <div className='relative z-50 pt-20'>
        <Navbar/>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/signup" element={ !user ? <SignUpPage/> : <Navigate to="/"/>}/>
          <Route path="/login" element={ !user ? <LoginPage/> : <Navigate to="/"/>}/>
          <Route path="/dashboard-secreta" element={ user?.cargo === "admin" ? <AdminPage/> : <Navigate to="/login"/>}/>
          <Route path="/categoria/:categoria" element={ <CategoriaPage/> }/>
          <Route path="/carrinho" element={ user ?  <CarrinhoPage/> : <Navigate to="/login" /> }/>
          <Route path="/purchase-success" element={ user ?  <PaginaSucessoCompra/> : <Navigate to="/login" /> }/>
          <Route path="/purchase-cancel" element={ user ?  <PaginaCancelarCompra/> : <Navigate to="/login" /> }/>
          <Route path="/verificar-email" element={<PaginaVerificarEmail/>}/>
          <Route path="/meus-pedidos" element={ user ? <MeusPedidos/> : <Navigate to="/login" /> }/>
          <Route path="/esqueceu-password" element={<PaginaEsqueceuPassword/>}/>
          <Route path="/reset-password/:token" element={<PaginaResetPassword/>}/>
        </Routes>
      </div>
      <Toaster />
    </div>
  ); 
}

export default App
