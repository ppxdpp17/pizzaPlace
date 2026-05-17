import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion as m } from "framer-motion";

const ESTADOS = [
  { value: "A Cozinhar", label: "A Cozinhar", color: "bg-red-500" },
  { value: "A Caminho", label: "A Caminho", color: "bg-orange-500" },
  { value: "Entregue", label: "Entregue", color: "bg-green-500" }
];

export default function EstadoDropdown({
  value,
  onChange,
  compact = false,
  placeholder = "Selecionar estado"
}) {
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

  const selected = ESTADOS.find(s => s.value === value);
  const btnWidthClass = compact ? "w-36" : "w-full";

  return (
    <div className={`relative ${btnWidthClass}`} ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { setOpen(v => !v); setFocusedIndex(-1); }}
        className={`flex items-center justify-between px-3 py-2 rounded-md ${compact ? "text-sm" : ""} bg-white text-gray-900 border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500`}
      >
        <div className="flex items-center gap-2">
          {selected ? (
            <span className={`${selected.color} w-2.5 h-2.5 rounded-full inline-block shadow-sm`} />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block shadow-sm" />
          )}
          <span className={selected ? "text-gray-900 font-bold" : "text-gray-500"}>
            {selected ? selected.label : placeholder}
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
            className="absolute left-0 mt-2 w-full max-h-44 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg z-50 p-1"
            role="listbox"
            aria-activedescendant={focusedIndex >= 0 ? `estado-${focusedIndex}` : undefined}
          >
            {ESTADOS.map((st, idx) => {
              const isSelected = st.value === value;
              const isFocused = idx === focusedIndex;
              const rowClass = isSelected ? "bg-red-50 text-red-700 font-bold" : isFocused ? "bg-gray-50 text-gray-900" : "text-gray-700 font-medium";
              return (
                <li key={st.value} id={`estado-${idx}`} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onMouseEnter={() => setFocusedIndex(idx)}
                    onMouseLeave={() => setFocusedIndex(-1)}
                    onClick={() => { onChange(st.value); setOpen(false); }}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition ${rowClass}`}
                  >
                    <div className={`w-1 h-6 rounded-md ${st.color}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{st.label}</div>
                    </div>
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