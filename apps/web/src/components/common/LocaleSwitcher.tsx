import { useEffect, useRef, useState } from "react";
import { useAlokaiI18nContext } from "../../context/AlokaiI18nContext";
import { SfIconExpandMore } from "@storefront-ui/react";

export default function LocaleSwitcher() {
  const { config, locales, setLocale } = useAlokaiI18nContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = locales.find(l => l.code === config.locale) ?? locales[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pick(code: string) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Change language"
        className="flex items-center gap-1.5 text-white font-medium px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          {current.code.toUpperCase()} · {current.currency}
        </span>
        <SfIconExpandMore size="sm" className="text-white opacity-70" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 text-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-700">
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
              Language &amp; Currency
            </span>
          </div>
          <ul>
            {locales.map(loc => {
              const isActive = loc.code === current.code;
              return (
                <li key={loc.code}>
                  <button
                    type="button"
                    onClick={() => pick(loc.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                      isActive
                        ? "bg-slate-800 text-cyan-400"
                        : "hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span className="text-lg leading-none">{loc.flag}</span>
                    <span className="flex-1">{loc.label}</span>
                    <span className="text-xs font-bold text-slate-400">
                      {loc.currency}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
