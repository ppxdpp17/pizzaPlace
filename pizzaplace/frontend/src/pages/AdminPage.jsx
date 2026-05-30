import { BarChart, PlusCircle, ShoppingBasket, Pizza } from "lucide-react"
import { useState } from "react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";

import CriarPizzaForm from "../components/CriarPizzaForm.jsx";
import Estatisticas from "../components/Estatisticas.jsx";
import ListaProdutos from "../components/ListaProdutos.jsx";
import Pedidos from "../components/Pedidos.jsx";

const janelas = [
    { id: "criar", label: "Adicionar Produto", icon: PlusCircle },
    { id: "produtos", label: "Produtos", icon: ShoppingBasket },
    { id: "analises", label: "Estatísticas", icon: BarChart },
    { id: "pedidos", label: "Pedidos", icon: Pizza },
];

const AdminPage = () => {
    const [tabAtiva, setTabAtiva] = useState("criar");
    const { getTodosProdutos } = useProductStore();

    useEffect(() => {
        getTodosProdutos();
    }, [getTodosProdutos]);

    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="relative z-10 container mx-auto px-4 py-16">
                <motion.h1
                    className="text-4xl font-bold mb-8 text-red-600 text-center"
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
                            className={`flex items-center px-4 py-2 mx-2 rounded-lg font-bold transition-all duration-200 ${tabAtiva === janela.id
                                ? "bg-red-600 text-white shadow-md transform scale-105"
                                : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-700 border border-gray-200 shadow-sm"
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
                {tabAtiva === "pedidos" && <Pedidos />}
            </div>
        </div>
    )
}

export default AdminPage