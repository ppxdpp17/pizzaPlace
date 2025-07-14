import { useEffect } from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCarrinhoStore } from "../stores/useCarrinhoStore";

const ProdutosRecomendados = ({produtosRecomendados}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itensPorPagina, setItensPorPagina] = useState(4);
  
    const {adicionarAoCarrinho} = useCarrinhoStore();

    useEffect(() => {
        const gerirResize = () => {
            if(window.innerWidth < 640) setItensPorPagina(1);
            else if (window.innerWidth < 1024 ) setItensPorPagina(2);
            else if (window.innerWidth < 1280 ) setItensPorPagina(3);
            else setItensPorPagina(4);
        };

        gerirResize();
        window.addEventListener("resize", gerirResize);
        return () => window.removeEventListener("resize", gerirResize);
    }, []);

    const proxSlide = () => {
        setCurrentIndex((prevIndex) => prevIndex + itensPorPagina);
    };

    const antSlide = () => {
        setCurrentIndex((prevIndex) => prevIndex - itensPorPagina);
    };

    const isInicioDesativado = currentIndex === 0;
    const isFimDesativado = currentIndex >= produtosRecomendados.length - itensPorPagina;

    return (
    <div className="py-12">
        <div className="container mx-auto px-4">
            <h2 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">Recomendados</h2>
            <div className="relative">
                <div className="overflow-hidden">
                    <div className="flex transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * 100 / itensPorPagina}%)` }}>
                            {produtosRecomendados?.map((produto) => (
                                <div key={produto._id} className="w-full sm:w-1/2 lg:w-1/3 xl:2-1/4 flex-shrink-0 px-2">
                                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-lgoverflow-hidden h-full transition-all
                                    duration-300 hover:shadow-lx border border-emerald-500/30">
                                        <div className="overflow-hidden">
                                            <img src={produto.imagem} 
                                                alt={produto.nome}
                                                className="w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-2 text-white">{produto.nome}</h3>
                                            <p className="text-emerald-300 font-medium mb-4">
                                                ${produto.preco.toFixed(2)}
                                            </p>
                                            <button onClick={() => adicionarAoCarrinho(produto)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded transition-colors duration-300
                                                    flex items-center justify-center">
                                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                                        Adicionar ao carrinho
                                            </button>
                                        </div>       
                                    </div>
                                </div>    
                            ))}
                    </div>
                </div>
                <button onClick={antSlide}
                    disabled={isInicioDesativado}
                    className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${isInicioDesativado ?
                        "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"}`}>
                            <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={proxSlide}
                    disabled={isFimDesativado}
                    className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${isFimDesativado ?
                        "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"}`}>
                            <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>

    </div>
  )
}

export default ProdutosRecomendados