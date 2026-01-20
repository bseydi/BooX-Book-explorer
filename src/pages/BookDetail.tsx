import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { coverUrl, getAuthor, getWork } from "../services/openLibrary";
import type { BookSearchItem, WorkDetail } from "../types/books";
import { useFavorites } from "../context/FavoritesContext";
import { useReading } from "../context/ReadingContext";
import { getWorkRating } from "../services/workRatings";

export default function BookDetail() {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();

  const [work, setWork] = useState<WorkDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { isRead, toggleRead } = useReading();

  const [workRating, setWorkRating] = useState<{ average?: number; count?: number; counts?: Record<string, number> } | null>(null);


  const openLibraryUrl = useMemo(() => {
    return workId ? `https://openlibrary.org/works/${workId}` : "#";
  }, [workId]);

  useEffect(() => {
    if (!workId) {
      setError("Identifiant du livre manquant.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load(id: string) {
      try {
        setIsLoading(true);
        setError(null);

        const w = await getWork(id);

        const authors = await Promise.all(
          w.authors.map(async (a) => {
            const ad = await getAuthor(a.authorId);
            return { authorId: a.authorId, name: ad.name };
          })
        );

        const r = await getWorkRating(id);

        if (cancelled) return;
        setWork({ ...w, authors });
        setWorkRating({ average: r.average, count: r.count, counts: r.counts });
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load(workId);

    return () => {
      cancelled = true;
    };
  }, [workId]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
        Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (!work) return <p>Introuvable.</p>;

  const asFavorite: BookSearchItem = {
    workId: work.workId,
    title: work.title,
    authors: work.authors.map((a) => a.name),
    coverId: work.covers[0],
  };

  const fav = isFavorite(work.workId);
  const read = isRead(work.workId);
  const mainCover = work.covers[0];

  function Stars({ value }: { value: number }) {
    const rounded = Math.round(value * 2) / 2; // demi-étoiles logique (mais rendu simple ici)
    const filled = Math.floor(rounded);

    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`Note ${value.toFixed(1)} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < filled ? "text-amber-500" : "text-zinc-300"}>
            ★
          </span>
        ))}
      </span>
    );
  }

  function RatingBars({ counts }: { counts: Record<string, number> }) {
    // counts: { "1": 12, "2": 40, "3": 120, "4": 350, "5": 900 } (parfois)
    const rows = [5, 4, 3, 2, 1];
    const max = Math.max(...rows.map((s) => counts[String(s)] ?? 0), 0);

    return (
      <div className="mt-3 space-y-1">
        {rows.map((s) => {
          const n = counts[String(s)] ?? 0;
          const pct = max > 0 ? (n / max) * 100 : 0;

          return (
            <div key={s} className="flex items-center gap-2">
              <div className="w-10 text-xs text-zinc-600">{s}★</div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
              </div>
              <div className="w-12 text-right text-xs text-zinc-500">{n}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
      >
        ← Retour
      </button>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="w-full sm:w-56">
            <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-100">
              {mainCover ? (
                <img
                  src={coverUrl(mainCover, "L")}
                  alt={`Couverture ${work.title}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                  Pas de couverture
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight">{work.title}</h1>
                <p className="mt-1 text-sm text-zinc-700">
                  {work.authors.length ? (
                    <>
                      Par <span className="font-semibold text-zinc-900">{work.authors.map((a) => a.name).join(", ")}</span>
                    </>
                  ) : (
                    "Auteur inconnu"
                  )}
                </p>
                {/* DATEEEEEEEE */}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(asFavorite)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-lg leading-none shadow-sm transition hover:bg-zinc-50 active:scale-95"
                  aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                  title={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  {fav ? "❤️" : "🤍"}
                </button>

                <button
                  type="button"
                  onClick={() => toggleRead(asFavorite)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition active:scale-95",
                    read ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-zinc-900 text-white hover:bg-zinc-800",
                  ].join(" ")}
                  aria-label={read ? "Retirer de Lu" : "Marquer comme Lu"}
                  title={read ? "Retirer de Lu" : "Marquer comme Lu"}
                >
                  {read ? "✓ Lu" : "+ Lu"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_19rem]">
              {/* ✅ Description = prend toute la largeur restante */}
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-zinc-900">Description</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
                  {work.description ?? "Description non disponible."}
                </p>
                <a
                  href={openLibraryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-medium text-indigo-700 underline decoration-indigo-200 underline-offset-4 hover:decoration-indigo-400"
                >
                  Voir sur Open Library
                </a>
              </div>

              {/* ✅ Notes = colonne droite (largeur fixe) */}
              <aside className="sm:sticky sm:top-[88px] h-fit">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Notes Open Library{" "}
                    <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                      community
                    </span>
                  </h2>

                  {typeof workRating?.average === "number" ? (
                    <>
                      <div className="mt-2 flex items-center gap-3">
                        <Stars value={workRating.average} />
                        <div className="text-sm">
                          <span className="font-semibold text-zinc-900">
                            {workRating.average.toFixed(1)}
                          </span>
                          <span className="text-zinc-500"> / 5</span>
                          {typeof workRating.count === "number" ? (
                            <span className="ml-2 text-zinc-500">
                              ({workRating.count.toLocaleString()} votes)
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {workRating.counts ? <RatingBars counts={workRating.counts} /> : null}
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-600">
                      Pas encore assez de votes pour afficher une note.
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>

        {work.subjects.length ? (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-zinc-900">Sujets</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {work.subjects.slice(0, 24).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => navigate(`/?q=${encodeURIComponent(s)}&page=1`)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
                  title={`Rechercher : ${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}