import { useState } from "react"
import { Link } from "react-router-dom"
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react"
import { motion } from "framer-motion"
import { useUserStore } from "../stores/useUserStore.js"

const SignUpPage = () => {

  const [dadosFormulario, setDadosFormulario] = useState({
    nome: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const {signup, loading} = useUserStore();
  
  const gerirSubmissao = (e) => {
    e.preventDefault();
    signup(dadosFormulario);
  }

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y:20 }}
                  animate={{ opacity: 1, y:0 }}
                  transition={{ duration: 0.8, delay:0.2 }}
                   >
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">Criar conta</h2>
      </motion.div>
      <motion.div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
                  initial={{ opacity: 0, y:20 }}
                  animate={{ opacity: 1, y:0 }}
                  transition={{ duration: 0.8, delay:0.2 }}
                   >
                    <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                      <form onSubmit={gerirSubmissao} className="space-y-6">
                        {/**Input para o nome */}
                        <div>
                          <label htmlFor="nome" className="block text-sm font-medium text-gray-300">
                            Nome completo
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <User className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </div>
                            <input
                              id="nome"
                              type="text"
                              required
                              value={dadosFormulario.nome}
                              onChange={(e) => setDadosFormulario({...dadosFormulario, nome: e.target.value})}
                              className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                              placeholder="John Doe">
                            </input>
                          </div>
                        </div>

                        {/*Input para o mail */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </div>
                            <input
                              id="email"
                              type="email"
                              required
                              value={dadosFormulario.email}
                              onChange={(e) => setDadosFormulario({...dadosFormulario, email: e.target.value})}
                              className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                              placeholder="mail@exemplo.com">
                            </input>
                          </div>
                        </div>

                        {/**Input para a password */}
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Palavra-passe
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </div>
                            <input
                              id="password"
                              type="password"
                              required
                              value={dadosFormulario.password}
                              onChange={(e) => setDadosFormulario({...dadosFormulario, password: e.target.value})}
                              className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                              placeholder="*********">
                            </input>
                          </div>
                        </div>

                        {/**Input para confirmar password */}
                        <div>
                          <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-300">
                            Confirmar Palavra-passe
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            </div>
                            <input
                              id="confirmarPassword"
                              type="password"
                              required
                              value={dadosFormulario.confirmarPassword}
                              onChange={(e) => setDadosFormulario({...dadosFormulario, confirmarPassword: e.target.value})}
                              className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                              placeholder="*********">
                            </input>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
                          hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
                          disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                                A carregar...
                              </>
                            ) : (
                              <>
                                <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                                Criar Conta
                              </>
                            )}
                        </button>
                      </form>

                      <p className="mt-8 text-center text-sm text-gray-400">
                        Já tem uma conta? {" "}
                        <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
                          Entrar <ArrowRight className="inline h-4 w-4"/>
                        </Link>
                      </p>
                    </div>
      </motion.div>
    </div>
  )
}
export default SignUpPage