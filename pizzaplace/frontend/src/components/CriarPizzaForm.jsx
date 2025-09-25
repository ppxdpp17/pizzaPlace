// src/pages/CriarPizzaForm.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader } from "lucide-react";
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

  const { criarProduto, loading } = useProductStore();

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
      //Opcional: se houver uma descrição, inclui-a (se quiseres)
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
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">Criar Novo Produto</h2>

      <form onSubmit={gerirSubmissao} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-300">Nome</label>
          <input
            type="text"
            id="nome"
            value={novoProduto.nome}
            onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/*Ingredients selector toggle*/}
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-300">Categoria</label>
          <select
            id="categoria"
            value={novoProduto.categoria}
            onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="preco" className="block text-sm font-medium text-gray-300">Preço</label>
          <input
            type="number"
            id="preco"
            step={0.01}
            value={novoProduto.preco}
            onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/*Toggle para ingredients (opcional)*/}
        <div className="flex items-center gap-3">
          <input
            id="toggle-ings"
            type="checkbox"
            checked={showIngredientes}
            onChange={(e) => setShowIngredientes(e.target.checked)}
            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-emerald-500 focus:ring-emerald-400"
          />
          <label htmlFor="toggle-ings" className="text-sm text-gray-300">
            Adicionar ingredientes ao produto (opcional)
          </label>
        </div>

        {/*Ingredients selector — só renderiza se showIngredientes for true*/}
        {showIngredientes && (
          <div>
            <label className="block text-sm font-medium text-gray-300">Ingredientes (opcional)</label>
            <IngredientsSelector
              value={novoProduto.ingredientes}
              onChange={(ings) => setNovoProduto({ ...novoProduto, ingredientes: ings })}
            />
            <p className="text-xs text-gray-400 mt-1">Se ficar vazio, o produto será criado sem ingredientes.</p>
          </div>
        )}

        {/*Escolher imagem*/}
        <div className="flex flex-col items-center">
          <input type="file" id="imagem" className="sr-only" accept="image/*" onChange={gerirMudancaImagem} />
          <label htmlFor="imagem" className="cursor-pointer bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600">
            <Upload className="h-5 inline-block mr-2" /> Escolher Imagem
          </label>
          {novoProduto.imagem && (
            <div className="mt-3 text-sm text-gray-300">Imagem pronta para upload (dataURL)</div>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-5 w-5 animate-spin" />
              A carregar...
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
