import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getHistory } from "../services/searchHistory";
import { searchBooks } from "../services/openLibrary";

type Props = {
  initialValue?: string;
  onSearch: (value: string) => void;
  isLoading?: boolean;
  getSuggestions?: (q: string) => Promise<string[]>;
};

type Suggestion =
  | { type: "history"; label: string }
  | { type: "api"; label: string; subtitle?: string };

export default function SearchBar({ initialValue = "", onSearch, isLoading }: Props) {
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);

  // API suggestions
  const [apiLoading, setApiLoading] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<Suggestion[]>([]);
  const debounceRef = useRef<number | null>(null);
  const reqIdRef = useRef(0);

  const inputId = useId();

  // Sync input with URL changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Suggestions depuis l'historique (instant)
  const historySuggestions = useMemo<Suggestion[]>(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return getHistory()
      .filter((h) => h.toLowerCase().includes(q))
      .slice(0, 6)
      .map((h) => ({ type: "history", label: h }));
  }, [value]);

  // Debounce + suggestions API
  useEffect(() => {
    const q = value.trim();
    setApiSuggestions([]);

    // On évite d'appeler l'API sur des requêtes trop courtes
    if (q.length < 3) {
      setApiLoading(false);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      const myReqId = ++reqIdRef.current;
      try {
        setApiLoading(true);
        const res = await searchBooks(q, 1);
        if (myReqId !== reqIdRef.current) return;

        const top = res.items.slice(0, 6).map((b) => ({
          type: "api" as const,
          label: b.title,
          subtitle: b.authors?.length ? b.authors.slice(0, 2).join(", ") : undefined,
        }));

        setApiSuggestions(top);
      } catch {
        // on ignore les erreurs de suggestions (pas bloquant)
        if (myReqId !== reqIdRef.current) return;
        setApiSuggestions([]);
      } finally {
        if (myReqId === reqIdRef.current) setApiLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value]);

  // const suggestions = useMemo(() => {
  //   // On affiche d'abord l'historique, puis l'API
  //   const merged = [...historySuggestions, ...apiSuggestions];

  //   // Enlève les doublons (même label)
  //   const seen = new Set<string>();
  //   return merged.filter((s) => {
  //     const k = s.label.toLowerCase();
  //     if (seen.has(k)) return false;
  //     seen.add(k);
  //     return true;
  //   });
  // }, [historySuggestions, apiSuggestions]);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setOpen(false);
    onSearch(trimmed);
  }

  return (
    <div className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label htmlFor={inputId} className="sr-only">
          Recherche de livre
        </label>

        <div className="relative w-full">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            🔎
          </span>

          <input
            id={inputId}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setValue("");
                setOpen(false);
              }
            }}
            placeholder="Titre, auteur, mot-clé…"
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-10 text-sm shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-200"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="search-suggestions"
          />

          {apiLoading ? (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 animate-pulse">
              ⏳
            </span>
          ) : null}
        </div>


        <div className="flex gap-2">
          {value.trim().length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
              aria-label="Effacer la recherche"
              title="Effacer"
            >
              Effacer
            </button>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
          >
            {isLoading ? "Recherche…" : "Rechercher"}
          </button>
        </div>
      </form>

      {/* Dropdown suggestions */}
      {open && value.trim().length > 0 ? (
        <div
          id="search-suggestions"
          className="absolute z-50 mt-2 w-full origin-top overflow-hidden rounded-2xl border border-zinc-200 bg-white/90 shadow-xl backdrop-blur transition"
        >
          <div className="max-h-72 overflow-auto">
            {historySuggestions.length > 0 ? (
              <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Historique
              </div>
            ) : null}

            <ul className="divide-y divide-zinc-100">
              {historySuggestions.map((s) => (
                <li key={`h:${s.label}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => submit(s.label)}
                    className="w-full px-4 py-3 text-left text-sm transition hover:bg-zinc-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-zinc-900">{s.label}</span>
                      <span className="text-xs text-zinc-500">↩︎</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {apiSuggestions.length > 0 ? (
              <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                Livres
              </div>
            ) : null}

            <ul className="divide-y divide-zinc-100">
              {apiSuggestions.map((s) => (
                <li key={`a:${s.label}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => submit(s.label)}
                    className="w-full px-4 py-3 text-left text-sm transition hover:bg-zinc-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-zinc-900">{s.label}</span>
                      <span className="text-xs text-zinc-500">Livre</span>
                    </div>
                    {"subtitle" in s && s.subtitle ? (
                      <div className="mt-0.5 text-xs text-zinc-600">{s.subtitle}</div>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

      ) : null}
    </div>
  );
}
