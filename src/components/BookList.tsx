import { useEffect, useMemo, useState } from "react";
import type { BookSearchItem } from "../types/books";
import BookCard from "./BookCard";
import { getWorkRating  } from "../services/workRatings";

type Props = { items: BookSearchItem[] };

export default function BookList({ items }: Props) {
  const [ratings, setRatings] = useState<Record<string, { avg?: number; count?: number }>>({});

  // reset (optionnel) : si tu veux éviter de garder des vieux ratings en mémoire UI
  useEffect(() => {
    // on ne wipe pas totalement, ça évite un “flash” quand tu reviens en arrière
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // On limite pour éviter trop d'appels (par ex: 20 premiers visibles)
      const slice = items.slice(0, 20);

      for (const b of slice) {
        const id = b.workId;
        if (!id) continue;

        // évite de recharger si déjà présent
        if (ratings[id]) continue;

        const r = await getWorkRating(id);
        if (cancelled) return;

        if (typeof r.rating === "number" || typeof r.rating_count === "number") {
          setRatings((prev) => ({
            ...prev,
            [id]: { avg: r.rating, count: r.rating_count },
          }));
        } else {
          // mémorise aussi "vide" pour ne pas refetch en boucle côté UI
          setRatings((prev) => ({ ...prev, [id]: {} }));
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
    // ⚠️ on ne met pas "ratings" en dépendance sinon boucle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const enriched = useMemo(() => {
    return items.map((b) => ({
      ...b,
      ratingAvg: ratings[b.workId]?.avg,
      ratingCount: ratings[b.workId]?.count,
    }));
  }, [items, ratings]);

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {enriched.map((b) => (
        <BookCard key={b.workId} book={b} />
      ))}
    </div>
  );
}
