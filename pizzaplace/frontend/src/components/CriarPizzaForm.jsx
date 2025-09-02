// src/pages/CriarPizzaForm.jsx
import { useState } from "react";
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
    descricao: "",
    preco: "",
    categoria: "",
    imagem: "",
    ingredientes: []
  });

  const { criarProduto, loading } = useProductStore();

  const gerirSubmissao = async (e) => {
    e.preventDefault();
    console.log("Enviar produto:", novoProduto);   
    try {
      await criarProduto(novoProduto);
      toast.success("Produto Criado Com Sucesso");
      setNovoProduto({ nome: "", descricao: "", preco: "", categoria: "", imagem: "", ingredientes: [] });
    } catch (error) {
      console.error("Erro ao criar o produto", error);
      toast.error("Erro NA CRIAÇÃO de produto");
    }
  };

  const gerirMudancaImagem = (e) => {
    const ficheiro = e.target.files[0];
    if (ficheiro) {
      const leitor = new FileReader();
      leitor.onloadend = () => {
        setNovoProduto({ ...novoProduto, imagem: leitor.result });
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
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">Criar Nova Pizza</h2>

      <form onSubmit={gerirSubmissao} className="space-y-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-300">Nome do Produto</label>
          <input
            type="text"
            id="nome"
            value={novoProduto.nome}
            onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-300">Descrição</label>
          <textarea
            id="descricao"
            value={novoProduto.descricao}
            onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/*Ingredients selector*/}
        <div>
          <label className="block text-sm font-medium text-gray-300">Ingredientes</label>
          <IngredientsSelector
            value={novoProduto.ingredientes}
            onChange={(ings) => setNovoProduto({ ...novoProduto, ingredientes: ings })}
          />
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

        {/*Escolher imagem*/}
        <div className="flex flex-col items-center">
          <input type="file" id="imagem" className="sr-only" accept="image/*" onChange={gerirMudancaImagem} />
          <label htmlFor="imagem" className="cursor-pointer bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600">
            <Upload className="h-5 inline-block mr-2" /> Escolher Imagem
          </label>
          {novoProduto.imagem && (
            <div className="mt-3 text-sm text-gray-300">Imagem Enviada com Sucesso</div>
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
