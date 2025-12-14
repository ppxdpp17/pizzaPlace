import { Link } from 'react-router-dom'

const CategoryItem = ({ categoria }) => {
    return (
        <div className="relative overflow-hidden h-96 w-full rounded-lg group bg-orange-50">
            <Link to={"/categoria" + categoria.href} >
                <div className="w-full h-full cursor-pointer">
                    <img src={categoria.imageUrl}
                        alt={categoria.nome}
                        className="w-full h-full object-cover transition-transform duration-500 
                    ease-out group-hover:scale-110"
                        loading="lazy" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <h3 className="text-gray-900 text-2xl font-bold mb-2">{categoria.nome}</h3>
                        <p className="text-gray-700 text-sm">Explorar {categoria.nome}</p>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default CategoryItem