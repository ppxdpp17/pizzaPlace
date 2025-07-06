import CategoryItem from "../components/CategoryItem";

const categorias = [
  { href: "/calcas", nome: "Calças", imageUrl: "calcas.avif" },
  { href: "/tshirts", nome: "T-shirts", imageUrl: "/tshirt.jpg" },
  { href: "/sapatos", nome: "Sapatos", imageUrl: "/tilhas.avif" },
  { href: "/oculos", nome: "Óculos", imageUrl: "/oculos.png" },
  { href: "/casacos", nome: "Casacos", imageUrl: "/casaco.avif" },
  { href: "/fatos", nome: "Fatos", imageUrl: "/suit.png" },
  { href: "/malas", nome: "Malas", imageUrl: "/mala.png" },
]

const HomePage = () => {
  return (
  <div className="relative min-h-screen text-white overflow-hidden">
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
        Explore as Nossas Categorias
      </h1>
      <p className="text-center text-xl text-gray-300 mb-12">
        Descubra as últimas trends da moda.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.map((categoria => (
          <CategoryItem
            categoria={categoria}
            key={categoria.nome}
          />
        )))}
      </div>
    </div>
  </div>
  )
};

export default HomePage;