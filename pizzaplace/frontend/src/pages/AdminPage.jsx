import { BarChart, PlusCircle, ShoppingBasket } from "lucide-react"
import { useState } from "react";
import { motion } from "framer-motion";

import CriarPizzaForm from "../components/CriarPizzaForm.jsx";
import Estatisticas from "../components/Estatisticas.jsx";
import ListaProdutos from "../components/ListaProdutos.jsx";

const janelas = [
    { id: "criar", label: "Adicionar Pizza", icon: PlusCircle},
    { id: "produtos", label: "Produtos", icon: ShoppingBasket},
    { id: "analises", label: "Estatísticas", icon: BarChart},
];

const AdminPage = () => {
    const [tabAtiva, setTabAtiva] = useState("criar");
    return (
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            <div className="relative z-10 container mx-auto px-4 py-16">
                <motion.h1
                    className="text-4xl font-bold mb-8 text-emerald-400 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Dashboard de Administrador
                </motion.h1>

                <div className="flex justify-center mb-8">
                    {janelas.map((janela) => (
                        <button
                            key={janela.id}
                            onClick={() => setTabAtiva(janela.id)}
                            className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${
                                tabAtiva === janela.id
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                            >
                                <janela.icon className="mr-2 h-5 2-5" />
                                {janela.label}
                        </button>
                    ))}
                </div>

                {tabAtiva === "criar" && <CriarPizzaForm />}
                {tabAtiva === "produtos" && <ListaProdutos />}
                {tabAtiva === "analises" && <Estatisticas />}
            </div>
        </div>
    )
}

export default AdminPage