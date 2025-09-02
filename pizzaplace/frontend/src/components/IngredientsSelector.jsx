// src/components/IngredientsSelector.jsx
import { useState, useMemo } from "react";
import { Plus, Search, X } from "lucide-react";

const DEFAULT_INGREDIENTS = [
  { nome: "Mozzarella", icone: "🧀" },
  { nome: "Tomate", icone: "🍅" },
  { nome: "Fiambre", icone: "🥓" },
  { nome: "Cebola", icone: "🧅" },
  { nome: "Pimento", icone: "🌶️" },
  { nome: "Azeitonas", icone: "🫒" },
];

export default function IngredientsSelector({ value = [], onChange }) {
  const [query, setQuery] = useState("");
  const [ingredients, setIngredients] = useState(DEFAULT_INGREDIENTS);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  const selected = value || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter(i => i.nome.toLowerCase().includes(q));
  }, [ingredients, query]);

  const toggleSelect = (ing) => {
    const exists = selected.find(x => x.nome === ing.nome);
    if (exists) {
      onChange(selected.filter(x => x.nome !== ing.nome));
    } else {
      onChange([...selected, ing]);
    }
  };

  const addIngredient = () => {
    const name = newName.trim();
    if (!name) return;
    const ing = { nome: name, icone: newIcon || "➕" };
    setIngredients(prev => [ing, ...prev]);
    onChange([...selected, ing]);
    setNewName("");
    setNewIcon("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            placeholder="Procurar ingrediente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-2 px-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Novo ingrediente"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="py-2 px-3 bg-gray-700 rounded-md text-white focus:outline-none"
          />
          <input
            placeholder="ícone (emoji)"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            className="w-24 py-2 px-3 bg-gray-700 rounded-md text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={addIngredient}
            className="py-2 px-3 bg-emerald-600 rounded-md text-white hover:bg-emerald-700"
          >
            <Plus />
          </button>
        </div>
      </div>

      <div className="max-h-44 overflow-auto grid grid-cols-2 gap-2">
        {filtered.map((ing) => {
          const isSelected = !!selected.find(x => x.nome === ing.nome);
          return (
            <button
              key={ing.nome}
              type="button"
              onClick={() => toggleSelect(ing)}
              className={`flex items-center gap-2 p-2 rounded-md text-sm transition ${
                isSelected ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              <span className="text-lg">{ing.icone || "•"}</span>
              <span className="flex-1 text-left">{ing.nome}</span>
              {isSelected && <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">OK</span>}
            </button>
          );
        })}
      </div>

      {/*chips de selecionados*/}
      <div className="flex flex-wrap gap-2">
        {selected.map(s => (
          <div key={s.nome} className="flex items-center gap-2 bg-gray-700 text-white px-2 py-1 rounded-md text-sm">
            <span className="text-lg">{s.icone || "•"}</span>
            <span>{s.nome}</span>
            <button type="button" onClick={() => onChange(selected.filter(x => x.nome !== s.nome))} className="ml-1">
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
