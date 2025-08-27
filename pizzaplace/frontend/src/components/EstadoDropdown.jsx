import { Circle, Check } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion as m } from "framer-motion";

const ESTADOS = [
  { value: "A Cozinhar", label: "A Cozinhar" },
  { value: "A Caminho",  label: "A Caminho" },
  { value: "Entregue",    label: "Entregue" }
];

export default function EstadoDropdown({ value, onChange, placeholder = "Selecionar estado" }) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, ESTADOS.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        onChange(ESTADOS[focusedIndex].value);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, focusedIndex, onChange]);

  const selectedLabel = (ESTADOS.find(s => s.value === value) || { label: "" }).label;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { setOpen(v => !v); setFocusedIndex(-1); }}
        className="w-full flex items-center justify-between p-2.5 rounded-md bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <div className="flex items-center gap-2">
          <Circle className="opacity-80" />
          <span className={`${selectedLabel ? "text-white" : "text-gray-300"}`}>
            {selectedLabel || placeholder}
          </span>
        </div>
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <m.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-0 right-0 mt-2 max-h-44 overflow-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 p-1"
            role="listbox"
            aria-activedescendant={focusedIndex >= 0 ? `estado-${focusedIndex}` : undefined}
          >
            {ESTADOS.map((st, idx) => {
              const selected = st.value === value;
              const focused = idx === focusedIndex;
              const activeBg = selected ? "bg-emerald-600 text-white" : focused ? "bg-gray-700 text-white" : "text-gray-200";
              return (
                <li key={st.value} id={`estado-${idx}`} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseEnter={() => setFocusedIndex(idx)}
                    onMouseLeave={() => setFocusedIndex(-1)}
                    onClick={() => { onChange(st.value); setOpen(false); }}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition ${activeBg}`}
                  >
                    <div className="w-4">
                      {selected ? <Check className="text-white" size={16}/> : <Circle className="text-gray-400" size={14} />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{st.label}</div>
                    </div>
                    {selected && <span className="text-xs px-2 py-1 bg-white/10 rounded-full">Selecionado</span>}
                  </button>
                </li>
              );
            })}
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
