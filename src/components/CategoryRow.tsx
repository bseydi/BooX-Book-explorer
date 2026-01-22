import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { BookSearchItem } from "../types/books";
import { coverUrl } from "../services/openLibrary";

type Props = {
  title: string;
  subject: string;
  items: BookSearchItem[];
  isLoading: boolean;
  error?: string | null;
  onSeeAll: (subject: string) => void;
};

export default function CategoryRow({ title, subject, items, isLoading, error, onSeeAll }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function updateArrows() {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // petit epsilon pour éviter les flottants
    const x = el.scrollLeft;
    setCanLeft(x > 2);
    setCanRight(x < max - 2);
  }

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });

    // si la fenêtre change, recalculer
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
    // relancer quand les items changent
  }, [items.length]);

  function scrollByPage(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(240, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <button
          type="button"
          onClick={() => onSeeAll(subject)}
          className="text-sm font-medium text-zinc-700 hover:underline"
        >
          Voir tout →
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-zinc-600">Chargement…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : (
        <div className="relative">
          {/* Dégradés doux sur les côtés */}
          <div className="pointer-events-none absolute inset-y-0 -left-5 w-4 bg-gradient-to-r from-zinc-50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 -right-5 w-4 bg-gradient-to-l from-zinc-50 to-transparent" />

          {/* Flèche gauche */}
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canLeft}
            aria-label="Défiler vers la gauche"
            className={[
              "absolute left-1 top-1/2 z-10 -translate-y-1/2",
              "rounded-full border border-zinc-200 bg-white/90 p-2 shadow-sm backdrop-blur",
              "transition hover:bg-white active:scale-95",
              "disabled:opacity-0 disabled:pointer-events-none",
            ].join(" ")}
          >
            ←
          </button>

          {/* Flèche droite */}
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canRight}
            aria-label="Défiler vers la droite"
            className={[
              "absolute right-1 top-1/2 z-10 -translate-y-1/2",
              "rounded-full border border-zinc-200 bg-white/90 p-2 shadow-sm backdrop-blur",
              "transition hover:bg-white active:scale-95",
              "disabled:opacity-0 disabled:pointer-events-none",
            ].join(" ")}
          >
            →
          </button>

          {/* Scroller */}
          <div
            ref={scrollerRef}
            className="overflow-x-auto px-4 no-scrollbar"
          >
            <div className="flex gap-3 pb-2 overflow-x-auto overflow-y-hidden snap-x snap-mandatory">
              {items.map((b) => (
                <Link
                  key={b.workId}
                  to={`/book/${b.workId}`}
                  className="group w-40 shrink-0 snap-start"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-sm transition
                group-hover:-translate-y-0.5 group-hover:shadow-md
                ring-1 ring-black/5
                group-hover:ring-2 group-hover:ring-indigo-200">
                    {b.coverId ? (
                      <img
                        src={coverUrl(b.coverId, "M")}
                        alt={`Couverture ${b.title}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs text-zinc-500">
                        No cover
                      </div>
                    )}

                    {/* léger dark gradient pour la lisibilité */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* ✅ Bloc titre (seul “fond clair”) */}
                    <div className="absolute inset-x-0 bottom-0 p-2">
                      <div className="rounded-xl bg-white/90 px-2.5 py-2 backdrop-blur">
                        <p className="line-clamp-2 text-xs font-semibold text-zinc-900">
                          {b.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-600">
                          {b.authors?.length ? b.authors[0] : "Auteur inconnu"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
