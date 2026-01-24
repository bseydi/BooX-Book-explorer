import type { BookSearchItem } from "../types/books";
import { coverUrl } from "../services/openLibrary";
import { useMemo } from "react";

type Category = { title: string; subject: string };

type Props = {
  categories: Category[];
  data: Record<string, BookSearchItem[]>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  onOpen: (subject: string) => void;
};

function heightClass(i: number) {
  // pattern simple : varie la hauteur pour l’effet “mosaic”
  const mod = i % 6;
  if (mod === 0) return "h-60";
  if (mod === 1) return "h-80";
  if (mod === 2) return "h-72";
  if (mod === 3) return "h-96";
  if (mod === 4) return "h-64";
  return "h-88";
}

export default function CategoryMasonry({ categories, data, loading, error, onOpen }: Props) {

  const coverBySubject = useMemo(() => {
    const used = new Set<number>();
    const map: Record<string, number | undefined> = {};

    for (const c of categories) {
      const items = data[c.subject] ?? [];

      // 1) on cherche une cover jamais utilisée
      let chosen: number | undefined = undefined;

      for (const b of items) {
        if (typeof b.coverId === "number" && !used.has(b.coverId)) {
          chosen = b.coverId;
          break;
        }
      }

      // 2) fallback : si toutes les covers sont déjà prises, on prend la 1ère dispo
      if (chosen === undefined) {
        chosen = items.find((b) => typeof b.coverId === "number")?.coverId;
      }

      if (typeof chosen === "number") used.add(chosen);
      map[c.subject] = chosen;
    }

    return map;
  }, [categories, data]);

  return (
    <div className="mt-4">
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {categories.map((c, i) => {
          const coverId = coverBySubject[c.subject];
          const isLoading = !!loading[c.subject];
          const err = error[c.subject];

          return (
            <div key={c.subject} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={() => onOpen(c.subject)}
                className={[
                  "group relative w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm",
                  "transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
                  heightClass(i),
                ].join(" ")}
                aria-label={`Ouvrir la catégorie ${c.title}`}
                title={c.title}
              >
                {/* Background image */}
                {coverId && !err ? (
                  <img
                    src={coverUrl(coverId, "L")}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 via-zinc-100 to-white" />
                )}

                {/* overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />

                {/* loading shimmer */}
                {isLoading ? (
                  <div className="absolute inset-0 animate-pulse bg-zinc-200/40" />
                ) : null}

                {/* bottom label */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-left text-lg font-semibold tracking-tight text-white drop-shadow">
                        {c.title}
                      </div>
                      <div className="mt-1 text-left text-xs text-white/80">
                        {err
                          ? "Erreur de chargement"
                          : isLoading
                            ? "Chargement…"
                              : "Explorer"}
                      </div>
                    </div>

                    <div className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      Voir
                    </div>
                  </div>
                </div>

                {/* focus ring */}
                <span className="absolute inset-0 rounded-3xl ring-0 ring-indigo-200 transition group-focus-visible:ring-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
