import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion as m } from "framer-motion";

export default function OptionDropdown({ options = [], value, onChange, placeholder = "-- Selecionar --", Icon = null }) {
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
        setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        const opt = options[focusedIndex];
        const val = typeof opt === "string" ? opt : (opt.id ?? opt.label);
        onChange && onChange(val);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, focusedIndex, onChange, options]);

  const renderLabel = (opt) => (typeof opt === "string" ? opt : opt.label ?? opt.id);

  const selectedLabel = (() => {
    if (!value) return null;
    const found = options.find((o) => (typeof o === "string" ? o === value : (o.id ?? o.label) === value));
    return found ? renderLabel(found) : value;
  })();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { setOpen(v => !v); setFocusedIndex(-1); }}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-gray-500" />}
          <span className={`${selectedLabel ? "text-gray-900 font-bold" : "text-gray-500 font-medium"}`}>
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
            className="absolute left-0 right-0 mt-2 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-1"
            role="listbox"
            aria-activedescendant={focusedIndex >= 0 ? `opt-${focusedIndex}` : undefined}
          >
            {options.map((opt, idx) => {
              const val = typeof opt === "string" ? opt : (opt.id ?? opt.label);
              const label = renderLabel(opt);
              const selected = val === value;
              const focused = idx === focusedIndex;
              return (
                <li key={val} id={`opt-${idx}`} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseEnter={() => setFocusedIndex(idx)}
                    onMouseLeave={() => setFocusedIndex(-1)}
                    onClick={() => { onChange && onChange(val); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-md transition 
                      ${selected ? "bg-red-50 text-red-700 font-bold" : (focused ? "bg-gray-50 text-gray-900 font-medium" : "text-gray-700 font-medium")}
                    `}
                  >
                    {label}
                    {selected && <span className="ml-2 text-xs font-bold px-2 py-1 bg-red-100 text-red-600 rounded-full">✓</span>}
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
