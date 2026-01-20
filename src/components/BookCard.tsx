import { Link } from "react-router-dom";
import type { BookSearchItem } from "../types/books";
import { coverUrl } from "../services/openLibrary";
import { useFavorites } from "../context/FavoritesContext";
import { useReading } from "../context/ReadingContext";
import { setLastClickedWorkId } from "../services/lastClicked";

type Props = { book: BookSearchItem };

export default function BookCard({ book }: Props) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isRead, toggleRead } = useReading();

    const fav = isFavorite(book.workId);
    const read = isRead(book.workId);

    return (
        <article className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex gap-4">
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    {book.coverId ? (
                        <img
                            src={coverUrl(book.coverId, "M")}
                            alt={`Couverture ${book.title}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                            No cover
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        <h3 className="min-w-0 flex-1">
                            <Link
                                to={`/book/${book.workId}`}
                                data-worklink={book.workId}
                                onClick={() => setLastClickedWorkId(book.workId)}
                                className="line-clamp-2 text-base font-semibold text-zinc-900 hover:underline"
                            >
                                {book.title}
                            </Link>

                        </h3>

                        <button
                            onClick={() => toggleFavorite(book)}
                            className="rounded-xl border border-zinc-200 bg-white px-2.5 py-2 text-lg leading-none transition hover:bg-zinc-50 active:scale-95"
                            aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                            title={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                            type="button"
                        >
                            {fav ? "❤️" : "🤍"}
                        </button>
                    </div>

                    <p className="mt-1 line-clamp-1 text-sm text-zinc-700">
                        {book.authors.length ? book.authors.join(", ") : "Auteur inconnu"}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                            {book.firstPublishYear ? `Publié : ${book.firstPublishYear}` : "Année inconnue"}
                        </span>

                        {typeof book.ratingsAverage === "number" ? (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-800 border border-amber-100">
                                ⭐ {book.ratingsAverage.toFixed(1)}
                                {typeof book.ratingsCount === "number" ? ` (${book.ratingsCount})` : ""}
                            </span>
                        ) : null}

                        <button
                            onClick={() => toggleRead(book)}
                            className={[
                                "rounded-full px-3 py-1 text-xs font-medium transition active:scale-95",
                                read
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-zinc-900 text-white hover:bg-zinc-800",
                            ].join(" ")}
                            aria-label={read ? "Retirer de Lu" : "Marquer comme Lu"}
                            title={read ? "Retirer de Lu" : "Marquer comme Lu"}
                            type="button"
                        >
                            {read ? "✓ Lu" : "+ Lu"}
                        </button>
                    </div>
                </div>
            </div>
        </article >
    );
}