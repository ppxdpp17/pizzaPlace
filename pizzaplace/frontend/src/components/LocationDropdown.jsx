import { MapPin } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion as m } from "framer-motion";

const LOCATIONS = [
  "Bragança (Av. João da Cruz)",
  "Bragança (Shopping)",
  "Vila Real",
  "Chaves",
  "Braga"
];


export default function LocationDropdown({ value, onChange, placeholder = "-- Selecionar localização --" }) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);

  //Fecha ao clicar fora
  useEffect(() => {
    function onDoc(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  //Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, LOCATIONS.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        onChange(LOCATIONS[focusedIndex]);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, focusedIndex, onChange]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { setOpen(v => !v); setFocusedIndex(-1); }}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <div className="flex items-center gap-3">
          <MapPin className="opacity-80" />
          <span className={`${value ? "text-white" : "text-gray-300"}`}>
            {value || placeholder}
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
            className="absolute left-0 right-0 mt-2 max-h-60 overflow-auto bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 p-1"
            role="listbox"
            aria-activedescendant={focusedIndex >= 0 ? `loc-${focusedIndex}` : undefined}
          >
            {LOCATIONS.map((loc, idx) => {
              const selected = loc === value;
              const focused = idx === focusedIndex;
              return (
                <li key={loc} id={`loc-${idx}`} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseEnter={() => setFocusedIndex(idx)}
                    onMouseLeave={() => setFocusedIndex(-1)}
                    onClick={() => { onChange(loc); setOpen(false); }}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition 
                      ${selected ? "bg-emerald-600 text-white" : (focused ? "bg-gray-700 text-white" : "text-gray-200")}
                    `}
                  >
                    <MapPin className={`${selected ? "text-white" : "text-gray-300"}`} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{loc}</div>
                    </div>
                    {selected && (
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full">Selecionado</span>
                    )}
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
