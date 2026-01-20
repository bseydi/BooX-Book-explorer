import { useEffect, useMemo, useState } from "react";
import BookList from "../components/BookList";
import { useFavorites } from "../context/FavoritesContext";

type SortMode = "title-asc" | "title-desc" | "author-asc" | "author-desc";

const PREFS_KEY = "book-explorer:favorites-prefs:v2";

function loadPrefs(): { sort: SortMode; filter: string } {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { sort: "title-asc", filter: "" };
    const p = JSON.parse(raw) as Partial<{ sort: SortMode; filter: string }>;
    return { sort: p.sort ?? "title-asc", filter: p.filter ?? "" };
  } catch {
    return { sort: "title-asc", filter: "" };
  }
}

function savePrefs(prefs: { sort: SortMode; filter: string }) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export default function Favorites() {
  const { favorites, clearFavorites } = useFavorites();

  const initial = loadPrefs();
  const [sort, setSort] = useState<SortMode>(initial.sort);

  const [filterInput, setFilterInput] = useState(initial.filter);
  const [filter, setFilter] = useState(initial.filter);

  useEffect(() => {
    const t = window.setTimeout(() => setFilter(filterInput), 150);
    return () => window.clearTimeout(t);
  }, [filterInput]);

  useEffect(() => {
    savePrefs({ sort, filter: filterInput });
  }, [sort, filterInput]);

  const { field, dir } = useMemo(() => {
    if (sort.startsWith("author")) return { field: "author" as const, dir: sort.endsWith("asc") ? "asc" : "desc" };
    return { field: "title" as const, dir: sort.endsWith("asc") ? "asc" : "desc" };
  }, [sort]);

  function setField(next: "title" | "author") {
    if (next === "title") setSort(dir === "asc" ? "title-asc" : "title-desc");
    else setSort(dir === "asc" ? "author-asc" : "author-desc");
  }

  function toggleDir() {
    if (field === "title") setSort(sort === "title-asc" ? "title-desc" : "title-asc");
    else setSort(sort === "author-asc" ? "author-desc" : "author-asc");
  }

  const filteredAndSorted = useMemo(() => {
    const q = filter.trim().toLowerCase();

    let list = favorites;
    if (q) {
      list = favorites.filter((b) => {
        const inTitle = b.title.toLowerCase().includes(q);
        const inAuthors = b.authors.join(", ").toLowerCase().includes(q);
        return inTitle || inAuthors;
      });
    }

    const copy = [...list];
    const byText = (a: string, b: string) =>
      a.localeCompare(b, undefined, { sensitivity: "base" });
    const firstAuthor = (arr: string[]) => arr[0] ?? "";

    switch (sort) {
      case "title-asc":
        copy.sort((a, b) => byText(a.title, b.title));
        break;
      case "title-desc":
        copy.sort((a, b) => byText(b.title, a.title));
        break;
      case "author-asc":
        copy.sort((a, b) => byText(firstAuthor(a.authors), firstAuthor(b.authors)));
        break;
      case "author-desc":
        copy.sort((a, b) => byText(firstAuthor(b.authors), firstAuthor(a.authors)));
        break;
    }

    return copy;
  }, [favorites, sort, filter]);

  const shownCount = filteredAndSorted.length;
  const totalCount = favorites.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Favoris</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {totalCount} au total{totalCount > 0 ? ` — ${shownCount} affichés` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (favorites.length === 0) return;
            const ok = confirm("Vider tous les favoris ?");
            if (ok) clearFavorites();
          }}
          disabled={favorites.length === 0}
          className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Vider
        </button>
      </div>

      {/* Barre filtres */}
      <div className="sticky top-[72px] z-30 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* 🔎 Filtre */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              🔎
            </span>
            <input
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              placeholder="Filtrer par titre ou auteur…"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pl-11 pr-10 text-sm shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-indigo-200"
            />
            {filterInput.trim().length ? (
              <button
                type="button"
                onClick={() => setFilterInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 active:scale-95"
                aria-label="Effacer le filtre"
                title="Effacer"
              >
                ✕
              </button>
            ) : null}
          </div>

          {/* Tri pills + dir */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
              {[
                { k: "title" as const, label: "Titre" },
                { k: "author" as const, label: "Auteur" },
              ].map((x) => {
                const active = field === x.k;
                return (
                  <button
                    key={x.k}
                    type="button"
                    onClick={() => setField(x.k)}
                    aria-pressed={active}
                    className={[
                      "rounded-xl px-3 py-2 text-xs font-semibold transition active:scale-95",
                      active
                        ? "bg-indigo-100 text-indigo-900"
                        : "text-zinc-700 hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    {x.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={toggleDir}
              className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 active:scale-95"
              title={dir === "asc" ? "Ascendant" : "Descendant"}
            >
              {dir === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
          <div>
            {filter.trim() ? (
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-800 border border-indigo-100">
                Filtre: “{filter.trim()}”
              </span>
            ) : null}
          </div>
          <div>
            {shownCount} / {totalCount}
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
          Aucun livre en favori.
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
          Aucun résultat pour “{filter}”.
        </div>
      ) : (
        <BookList items={filteredAndSorted} />
      )}
    </div>
  );
}
