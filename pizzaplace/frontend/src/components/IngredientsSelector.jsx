import { useEffect, useState, useRef } from "react";
import axios from "../lib/axios";
import { Plus } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

export default function IngredientsSelector({ value = [], onChange, allowAdd = true }) {
  const [ingredientes, setIngredientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoIcone, setNovoIcone] = useState("");
  const [query, setQuery] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    fetchIngredientes();
    return () => (mountedRef.current = false);
  }, []);

  const fetchIngredientes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/ingredientes");
      if (!mountedRef.current) return;
      setIngredientes(res.data.ingredientes ?? []);
    } catch (err) {
      console.error("Erro a buscar ingredientes:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    if (!onChange) return;
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...(value || []), id]);
    }
  };

  const criarNovoIngrediente = async () => {
    if (!novoNome.trim()) return;
    try {
      const res = await axios.post("/ingredientes", { nome: novoNome.trim(), icone: novoIcone.trim() });
      const novo = res.data.ingrediente;
      setIngredientes((s) => [novo, ...s]);
      onChange([...(value || []), novo._id]);
      setNovoNome("");
      setNovoIcone("");
      setShowAdd(false);
    } catch (err) {
      console.error("Erro ao criar ingrediente:", err);
      alert(err.response?.data?.msg || "Erro ao criar ingrediente");
    }
  };

  const listaFiltrada = ingredientes.filter((i) =>
    i.nome.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar ingredientes..."
          className="flex-1 p-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
        />
        {allowAdd && (
          <button
            type="button"
            onClick={() => setShowAdd((s) => !s)}
            className="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-lg border border-red-100 hover:bg-red-100 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} /> <span className="text-sm">Novo</span>
          </button>
        )}
      </div>

      {showAdd && (
        <div className="flex gap-2 mb-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome"
            className="flex-1 p-2 rounded-md bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          />
          <input
            value={novoIcone}
            onChange={(e) => setNovoIcone(e.target.value)}
            placeholder="Ícone (ex: 🧀)"
            className="w-32 p-2 rounded-md bg-white border border-gray-300 text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          />
          <button
            type="button"
            onClick={criarNovoIngrediente}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-sm transition-colors"
          >
            Adicionar
          </button>
        </div>
      )}

      <div
        className="grid grid-flow-col grid-rows-2 auto-cols-max gap-3 overflow-x-auto py-2 pb-3 px-2
                   scrollbar-styled scroll-smooth snap-x snap-mandatory"
        role="list"
        aria-label="Lista de ingredientes"
      >
        {loading && (
          <div className="flex items-center justify-center w-full min-w-40 py-2">
            <LoadingSpinner embedded={true} />
          </div>
        )}
        {!loading && listaFiltrada.length === 0 && (
          <div className="text-sm font-medium text-gray-500 whitespace-nowrap">Nenhum ingrediente encontrado</div>
        )}

        {listaFiltrada.map((ing) => {
          const selected = value.includes(ing._id);
          return (
            <button
              key={ing._id}
              type="button"
              onClick={() => toggleSelect(ing._id)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-2xl flex-shrink-0 transition-all duration-200 border
                ${selected ? "bg-red-500 text-white shadow-md border-red-500" : "bg-white text-gray-600 border-gray-200 shadow-sm hover:border-red-300 hover:bg-red-50 hover:text-red-700"}
              snap-center`}
              style={{ width: 120, height: 88 }}
              aria-pressed={selected}
            >
              <span className="text-2xl leading-none">{ing.icone || "🍕"}</span>
              <span className="text-sm font-medium text-center truncate">{ing.nome}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
