import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CartaoProduto from "./CartaoProduto";

const ProdutosRecomendados = ({ produtosRecomendados }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsPerPage(1);
            else if (window.innerWidth < 1024) setItemsPerPage(2);
            else if (window.innerWidth < 1280) setItemsPerPage(3);
            else setItemsPerPage(4);
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Set initial items per page

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!produtosRecomendados || produtosRecomendados.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex + itemsPerPage >= produtosRecomendados.length ? 0 : prevIndex + itemsPerPage
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex - itemsPerPage < 0
                ? Math.max(0, produtosRecomendados.length - itemsPerPage)
                : prevIndex - itemsPerPage
        );
    };

    const isInicioDesativado = currentIndex === 0;
    const isFimDesativado = currentIndex >= produtosRecomendados.length - itemsPerPage;

    return (
        <div className='mt-8 py-12'>
            <div className="container mx-auto px-4">
                <h3 className='text-2xl font-semibold text-red-600 mb-4'>Recomendados para si</h3>
                <div className='relative'>
                    <div className='overflow-hidden'>
                        <div
                            className='flex transition-transform duration-500 ease-out gap-4'
                            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
                        >
                            {produtosRecomendados.map((produto) => (
                                <div key={produto._id} className='w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 flex justify-center'>
                                    <CartaoProduto product={produto} animate={false} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={prevSlide}
                        disabled={isInicioDesativado}
                        className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${isInicioDesativado ?
                            "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-500 text-white"}`}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        disabled={isFimDesativado}
                        className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${isFimDesativado ?
                            "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-500 text-white"}`}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProdutosRecomendados;