import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useReading } from "../context/ReadingContext";
import { coverUrl } from "../services/openLibrary";
import ReadNoteEditor from "../components/ReadNoteEditor";
import StarRating from "../components/StarRating";
import { getRating } from "../services/readRatings";
import { getReadPrefs, setReadPrefs } from "../services/readPrefs";

type SortMode = "recent" | "title-asc" | "title-desc" | "rating-desc" | "rating-asc";

export default function Read() {
  const { read, isRead, toggleRead } = useReading();

  const prefs = getReadPrefs();
  const [sort, setSort] = useState<SortMode>(prefs.sort);
  const [minRating, setMinRating] = useState<number>(prefs.minRating);

  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setQuery(queryInput), 150);
    return () => window.clearTimeout(t);
  }, [queryInput]);

  useEffect(() => {
    setReadPrefs({ sort, minRating });
  }, [sort, minRating]);

  const { field, dir } = useMemo(() => {
    if (sort.startsWith("title")) return { field: "title" as const, dir: sort.endsWith("asc") ? "asc" : "desc" };
    if (sort.startsWith("rating")) return { field: "rating" as const, dir: sort.endsWith("asc") ? "asc" : "desc" };
    return { field: "recent" as const, dir: "desc" as const };
  }, [sort]);

  function setField(next: "recent" | "rating" | "title") {
    if (next === "recent") {
      setSort("recent");
      return;
    }
    if (next === "rating") {
      // par défaut: desc
      setSort(dir === "asc" ? "rating-asc" : "rating-desc");
      return;
    }
    // title
    setSort(dir === "desc" ? "title-desc" : "title-asc");
  }

  function toggleDir() {
    if (field === "recent") return;
    if (field === "rating") {
      setSort(sort === "rating-asc" ? "rating-desc" : "rating-asc");
    } else if (field === "title") {
      setSort(sort === "title-asc" ? "title-desc" : "title-asc");
    }
  }

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = read
      .map((b) => ({ book: b, rating: getRating(b.workId) }))
      .filter((x) => x.rating >= minRating);

    if (q) {
      list = list.filter((x) => {
        const inTitle = x.book.title.toLowerCase().includes(q);
        const inAuthors = x.book.authors.join(", ").toLowerCase().includes(q);
        return inTitle || inAuthors;
      });
    }

    const byText = (a: string, b: string) =>
      a.localeCompare(b, undefined, { sensitivity: "base" });

    switch (sort) {
      case "recent":
        // on garde l'ordre actuel
        break;
      case "title-asc":
        list.sort((a, b) => byText(a.book.title, b.book.title));
        break;
      case "title-desc":
        list.sort((a, b) => byText(b.book.title, a.book.title));
        break;
      case "rating-asc":
        list.sort((a, b) => a.rating - b.rating);
        break;
      case "rating-desc":
        list.sort((a, b) => b.rating - a.rating);
        break;
    }

    return list.map((x) => x.book);
  }, [read, sort, minRating, query]);

  const shownCount = filteredAndSorted.length;
  const totalCount = read.length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lu</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Livres terminés avec notes et évaluations.
        </p>
      </div>

      {/* Barre filtres */}
      <div className="sticky top-[72px] z-30 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* 🔎 Recherche */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              🔎
            </span>
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Rechercher dans Lu…"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pl-11 pr-10 text-sm shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-indigo-200"
            />
            {queryInput.trim() ? (
              <button
                type="button"
                onClick={() => setQueryInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 active:scale-95"
                aria-label="Effacer"
                title="Effacer"
              >
                ✕
              </button>
            ) : null}
          </div>

          {/* Tri (pills) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
              {[
                { k: "recent" as const, label: "Récent" },
                { k: "rating" as const, label: "Note" },
                { k: "title" as const, label: "Titre" },
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

            {field !== "recent" ? (
              <button
                type="button"
                onClick={toggleDir}
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 active:scale-95"
                title={dir === "asc" ? "Ascendant" : "Descendant"}
              >
                {dir === "asc" ? "↑" : "↓"}
              </button>
            ) : null}
          </div>

          {/* Min ★ (pills) */}
          <div className="sm:ml-auto">
            <div className="inline-flex items-center gap-1 rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
              {[0, 1, 2, 3, 4, 5].map((v) => {
                const active = minRating === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMinRating(v)}
                    aria-pressed={active}
                    className={[
                      "rounded-xl px-3 py-2 text-xs font-semibold transition active:scale-95",
                      active
                        ? "bg-amber-100 text-amber-900"
                        : "text-zinc-700 hover:bg-zinc-50",
                    ].join(" ")}
                    title={v === 0 ? "Toutes les notes" : `${v}+ étoiles`}
                  >
                    {v === 0 ? "Tous" : `${v}★+`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
          <div>
            {query.trim() ? (
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-800 border border-indigo-100">
                Filtre: “{query.trim()}”
              </span>
            ) : null}
          </div>
          <div>
            {shownCount} / {totalCount}
          </div>
        </div>
      </div>

      {read.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
          Aucun livre marqué comme lu.
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
          Aucun livre ne correspond au filtre.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredAndSorted.map((book) => {
            const marked = isRead(book.workId);
            return (
              <article
                key={book.workId}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex gap-4">
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    {book.coverId ? (
                      <img
                        src={coverUrl(book.coverId, "M")}
                        alt={`Couverture ${book.title}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="min-w-0 text-base font-semibold">
                        <Link to={`/book/${book.workId}`} className="line-clamp-2 hover:underline">
                          {book.title}
                        </Link>
                      </h3>

                      {marked ? (
                        <button
                          onClick={() => toggleRead(book)}
                          className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-200 active:scale-95"
                          title="Retirer de Lu"
                          type="button"
                        >
                          ✓ Lu
                        </button>
                      ) : null}
                    </div>

                    <p className="mt-1 text-sm text-zinc-700">{book.authors.join(", ")}</p>

                    <StarRating workId={book.workId} />
                    <ReadNoteEditor workId={book.workId} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
