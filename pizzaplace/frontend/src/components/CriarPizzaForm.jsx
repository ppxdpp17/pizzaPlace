// src/pages/CriarPizzaForm.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useProductStore } from "../stores/useProductStore";
import IngredientsSelector from "../components/IngredientsSelector";

const categorias = [
  { value: "pizzas", label: "Pizzas" },
  { value: "bebidas", label: "Bebidas" },
  { value: "entradas", label: "Entradas & Sobremesas" }
];

const CriarPizzaForm = () => {
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    preco: "",
    categoria: "",
    imagem: "",
    ingredientes: []
  });

  const [showIngredientes, setShowIngredientes] = useState(false); //Toggle para mostrar selector

  const { criarProduto, isLoading } = useProductStore();

  //Quando a categoria muda, por defeito mostrar ingredientes só se for "pizzas"
  useEffect(() => {
    if (novoProduto.categoria === "pizzas") {
      setShowIngredientes(true);
    } else {
      setShowIngredientes(false);
    }
  }, [novoProduto.categoria]);

  const gerirSubmissao = async (e) => {
    e.preventDefault();

    try {
      //Montar payload: só inclui ingredientes se o toggle estiver activo
      const payload = {
        nome: novoProduto.nome,
        preco: Number(novoProduto.preco),
        categoria: novoProduto.categoria,
        imagem: novoProduto.imagem || ""
      };

      if (showIngredientes && Array.isArray(novoProduto.ingredientes) && novoProduto.ingredientes.length > 0) {
        payload.ingredientes = novoProduto.ingredientes;
      }
      //Incluir descrição (opcional)
      if (novoProduto.descricao) payload.descricao = novoProduto.descricao;

      await criarProduto(payload);
      toast.success("Produto criado com sucesso");
      setNovoProduto({ nome: "", preco: "", categoria: "", imagem: "", ingredientes: [] });
      setShowIngredientes(false);
    } catch (error) {
      console.error("Erro ao criar o produto", error);
      toast.error(error.response?.data?.msg || "Erro na criação do produto");
    }
  };

  const gerirMudancaImagem = (e) => {
    const ficheiro = e.target.files[0];
    if (ficheiro) {
      const leitor = new FileReader();
      leitor.onloadend = () => {
        setNovoProduto((s) => ({ ...s, imagem: leitor.result }));
      };
      leitor.readAsDataURL(ficheiro);
    }
  };

  return (
    <motion.div
      className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200 rounded-xl p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-3 text-center">
        Criar Novo Produto
      </h2>

      <form onSubmit={gerirSubmissao} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-bold text-gray-700">Nome</label>
          <input
            type="text"
            id="nome"
            value={novoProduto.nome}
            onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            required
          />
        </div>

        {/*Ingredients selector toggle*/}
        <div>
          <label htmlFor="categoria" className="block text-sm font-bold text-gray-700">Categoria</label>
          <select
            id="categoria"
            value={novoProduto.categoria}
            onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="preco" className="block text-sm font-bold text-gray-700">Preço</label>
          <input
            type="number"
            id="preco"
            step={0.01}
            value={novoProduto.preco}
            onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
            className="mt-1 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            required
          />
        </div>

        {/*Toggle para ingredients (opcional)*/}
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <input
            id="toggle-ings"
            type="checkbox"
            checked={showIngredientes}
            onChange={(e) => setShowIngredientes(e.target.checked)}
            className="h-4 w-4 rounded bg-white border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="toggle-ings" className="text-sm font-medium text-gray-700">
            Adicionar ingredientes ao produto (opcional)
          </label>
        </div>

        {/*Ingredients selector — só renderiza se showIngredientes for true*/}
        {showIngredientes && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <label className="block text-sm font-bold text-gray-700 mb-2">Selecione os Ingredientes</label>
            <IngredientsSelector
              value={novoProduto.ingredientes}
              onChange={(ings) => setNovoProduto({ ...novoProduto, ingredientes: ings })}
            />
            <p className="text-xs text-gray-500 mt-2">Dica: Se ficar vazio, o produto será criado na mesma.</p>
          </div>
        )}

        {/*Escolher imagem*/}
        <div className="flex flex-col items-center pt-2">
          <input type="file" id="imagem" className="sr-only" accept="image/*" onChange={gerirMudancaImagem} />
          <label htmlFor="imagem" className="cursor-pointer bg-white py-2.5 px-6 border border-gray-300 rounded-lg shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <Upload className="h-5 inline-block mr-2" /> Escolher Imagem
          </label>
          {novoProduto.imagem && (
            <div className="mt-4 flex flex-col items-center">
              <span className="text-sm font-medium text-gray-600 mb-2">Pré-visualização:</span>
              <img src={novoProduto.imagem} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full mt-6 py-3 px-4 rounded-lg shadow-md font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              A Criar...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              Criar Produto
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CriarPizzaForm;
