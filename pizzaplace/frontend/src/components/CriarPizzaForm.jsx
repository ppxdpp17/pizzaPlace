import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader, Plus } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import axios from "../lib/axios";
import toast from "react-hot-toast";

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
  });

  const { criarProduto, loading } = useProductStore();

  // Ingredientes
  const [ingredientesLista, setIngredientesLista] = useState([]); // todos do backend
  const [selected, setSelected] = useState([]); // array de objetos ingrediente selecionados
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [newIngredienteNome, setNewIngredienteNome] = useState("");
  const [newIngredienteIcon, setNewIngredienteIcon] = useState("");

  useEffect(() => {
    fetchIngredientes();
  }, []);

  const fetchIngredientes = async () => {
    try {
      const res = await axios.get("/ingredientes");
      setIngredientesLista(res.data.ingredientes ?? res.data);
    } catch (err) {
      console.error("Erro ao carregar ingredientes", err);
    }
  };

  const toggleSelect = (ingrediente) => {
    setSelected(prev => {
      const exists = prev.find(i => i._id === ingrediente._id);
      if (exists) return prev.filter(i => i._id !== ingrediente._id);
      return [...prev, ingrediente];
    });
  };

  const handleAddIngrediente = async () => {
    if (!newIngredienteNome.trim()) {
      toast.error("Insira o nome do ingrediente");
      return;
    }
    try {
      const res = await axios.post("/ingredientes", { nome: newIngredienteNome.trim(), icone: newIngredienteIcon.trim() });
      const criado = res.data.ingrediente;
      setIngredientesLista(prev => [criado, ...prev]);
      setSelected(prev => [criado, ...prev]);
      setAdding(false);
      setNewIngredienteNome("");
      setNewIngredienteIcon("");
      toast.success("Ingrediente criado e selecionado");
    } catch (err) {
      console.error("Erro ao criar ingrediente", err);
      toast.error(err.response?.data?.msg || "Erro ao criar ingrediente");
    }
  };

  const gerirSubmissao = async (e) => {
    e.preventDefault();

    // transforma selected em array de ids
    const ingredientesIds = selected.map(i => i._id);

    try {
      await criarProduto({ ...novoProduto, ingredientes: ingredientesIds });
      toast.success("Produto Criado Com Sucesso");
      setNovoProduto({ nome: "", descricao: "", preco: "", categoria: "", imagem: "" });
      setSelected([]);
    } catch (err) {
      console.error("Erro ao criar produto", err);
      toast.error("Erro NA CRIAÇÃO de produto");
    }
  };

  const gerirMudancaImagem = (e) => {
    const ficheiro = e.target.files[0];
    if (ficheiro) {
      const leitor = new FileReader();
      leitor.onloadend = () => {
        setNovoProduto(prev => ({ ...prev, imagem: leitor.result }));
      };
      leitor.readAsDataURL(ficheiro); // base64
    }
  };

  const ingredientesFiltrados = ingredientesLista.filter(i =>
    i.nome.toLowerCase().includes(search.toLowerCase())
  );

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
            name="nome"
            value={novoProduto.nome}
            onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Ingredients selector (substitui descrição) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ingredientes</label>

          <div className="mb-2 flex gap-2">
            <input
              placeholder="Pesquisar ingredientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setAdding(v => !v)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md"
            >
              <Plus size={16} /> <span className="text-sm">Adicionar</span>
            </button>
          </div>

          {adding && (
            <div className="mb-3 space-y-2">
              <input
                placeholder="Nome do ingrediente"
                value={newIngredienteNome}
                onChange={(e) => setNewIngredienteNome(e.target.value)}
                className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
              />
              <input
                placeholder="Ícone (emoji ou texto curto opcional)"
                value={newIngredienteIcon}
                onChange={(e) => setNewIngredienteIcon(e.target.value)}
                className="w-full p-2 rounded-md bg-gray-700 text-white border border-gray-600"
              />
              <div className="flex gap-2">
                <button type="button" onClick={handleAddIngrediente} className="px-3 py-2 bg-emerald-600 rounded-md">Criar ingrediente</button>
                <button type="button" onClick={() => setAdding(false)} className="px-3 py-2 bg-gray-700 rounded-md border border-gray-600">Cancelar</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto p-1">
            {ingredientesFiltrados.map(i => {
              const escolhido = !!selected.find(s => s._id === i._id);
              return (
                <button
                  key={i._id}
                  type="button"
                  onClick={() => toggleSelect(i)}
                  className={`flex items-center gap-3 p-2 rounded-md text-left transition ${escolhido ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-black/20">
                    <span>{i.icone || "🍕"}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{i.nome}</div>
                  </div>
                </button>
              );
            })}
            {ingredientesFiltrados.length === 0 && <div className="text-sm text-gray-400 p-2">Nenhum ingrediente</div>}
          </div>

          {/* Mostra selecionados */}
          {selected.length > 0 && (
            <div className="mt-2 text-sm text-gray-300">
              Seleccionados: {selected.map(s => s.nome).join(", ")}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="preco" className="block text-sm font-medium text-gray-300">Preço</label>
          <input
            type="number"
            id="preco"
            name="preco"
            step={0.01}
            value={novoProduto.preco}
            onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-300">Categoria</label>
          <select
            id="categoria"
            name="categoria"
            value={novoProduto.categoria}
            onChange={(e) => setNovoProduto({ ...novoProduto, categoria: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-center">
          <input type="file" id="imagem" className="sr-only" accept="image/*" onChange={gerirMudancaImagem} />
          <label htmlFor="imagem" className="cursor-pointer inline-flex items-center gap-2 bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 focus:outline-none">
            <Upload className="h-5 w-5" />Escolher Imagem
          </label>

          {novoProduto.imagem && (
            <div className="mt-3 text-sm text-gray-300">Imagem Enviada com Sucesso</div>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
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
