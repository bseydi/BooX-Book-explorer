import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import BookList from "../components/BookList";
import { searchBooks } from "../services/openLibrary";
import type { BookSearchItem } from "../types/books";
import { getCachedPage, setCachedPage } from "../services/searchCache";
import { addToHistory, clearHistory, getHistory } from "../services/searchHistory";
import SearchHistory from "../components/SearchHistory";
import { useCallback } from "react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { saveScroll, restoreScroll } from "../services/scrollRestore";
import { setLastSearchUrl } from "../services/lastSearch";
import CategoryRow from "../components/CategoryRow";
import { getSubjectBooks } from "../services/openLibrarySubjects";
import { getLastClickedWorkId, clearLastClickedWorkId } from "../services/lastClicked";
import AlertCard from "../components/ui/AlertCard";


export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navType = useNavigationType(); // "POP" | "PUSH" | "REPLACE"
    const urlKey = location.pathname + location.search; // ex: "/?q=dune&page=3"

    const query = searchParams.get("q") ?? "";
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const hasSearch = query.trim().length > 0;

    const [items, setItems] = useState<BookSearchItem[]>([]);
    const [numFound, setNumFound] = useState(0);
    const [history, setHistory] = useState<string[]>(() => getHistory());
    const loadingMoreLock = useRef(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [errorInitial, setErrorInitial] = useState<string | null>(null);
    const [errorMore, setErrorMore] = useState<string | null>(null);

    const [catData, setCatData] = useState<Record<string, BookSearchItem[]>>({});
    const [catLoading, setCatLoading] = useState<Record<string, boolean>>({});
    const [catError, setCatError] = useState<Record<string, string | null>>({});

    const nonce = searchParams.get("n") ?? "";
    const key = useMemo(() => `${query.trim().toLowerCase()}::${page}::${nonce}`, [query, page, nonce]);

    const didRestoreRef = useRef(false);

    const CATEGORIES = [
        { title: "Thriller", subject: "thriller" },
        { title: "Histoire", subject: "history" },
        { title: "Fantasy", subject: "fantasy" },
        { title: "Romance", subject: "romance" },
        { title: "Science-fiction", subject: "science_fiction" },
    ];


    useEffect(() => {
        if (hasSearch) return;

        let cancelled = false;

        async function loadCategories() {
            for (const c of CATEGORIES) {
                try {
                    setCatLoading((p) => ({ ...p, [c.subject]: true }));
                    setCatError((p) => ({ ...p, [c.subject]: null }));

                    const items = await getSubjectBooks(c.subject, 18);
                    if (cancelled) return;

                    setCatData((p) => ({ ...p, [c.subject]: items }));
                } catch (e) {
                    if (cancelled) return;
                    setCatError((p) => ({
                        ...p,
                        [c.subject]: e instanceof Error ? e.message : "Erreur",
                    }));
                } finally {
                    if (!cancelled) setCatLoading((p) => ({ ...p, [c.subject]: false }));
                }
            }
        }

        loadCategories();
        return () => {
            cancelled = true;
        };
    }, [hasSearch]);


    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (page === 1) setErrorInitial(null);
            else setErrorMore(null);

            const q = query.trim();
            if (!q) {
                setItems([]);
                setNumFound(0);
                setIsLoadingInitial(false);
                setIsLoadingMore(false);
                return;
            }

            if (page === 1) {
                setItems([]);
                setNumFound(0);
            }

            try {
                if (page === 1) setIsLoadingInitial(true);
                else setIsLoadingMore(true);

                let all: BookSearchItem[] = [];
                let found = 0;

                // On reconstruit la liste page 1..page, en utilisant le cache si possible
                for (let p = 1; p <= page; p++) {
                    const cached = getCachedPage(q, p);

                    if (cached) {
                        all = [...all, ...cached.items];
                        found = cached.numFound;
                        continue;
                    }

                    const res = await searchBooks(q, p);
                    setCachedPage(q, p, res.items, res.numFound);

                    all = [...all, ...res.items];
                    found = res.numFound;
                }

                if (cancelled) return;
                setItems(all);
                setNumFound(found);
            } catch (e) {
                if (cancelled) return;
                const msg = e instanceof Error ? e.message : "Erreur inconnue";

                if (page === 1) setErrorInitial(msg);
                else setErrorMore(msg);
            } finally {
                if (!cancelled) {
                    setIsLoadingInitial(false);
                    setIsLoadingMore(false);
                    loadingMoreLock.current = false;
                }
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [key]);

    useEffect(() => {
        if (navType !== "POP") return;
        if (didRestoreRef.current) return;

        const y = restoreScroll(urlKey);
        if (y === null) return;

        requestAnimationFrame(() => {
            window.scrollTo(0, y);

            const lastId = getLastClickedWorkId();
            if (lastId) {
                const el = document.querySelector<HTMLAnchorElement>(`a[data-worklink="${lastId}"]`);
                el?.focus();
                clearLastClickedWorkId();
            }
            didRestoreRef.current = true;
        });
    }, [urlKey, navType]);

    function runSearch(nextQuery: string) {
        const q = nextQuery.trim();
        addToHistory(q);
        setHistory(getHistory());

        if (!q) {
            setSearchParams({});
            return;
        }
        setSearchParams({ q, page: "1" });
    }

    useEffect(() => {
        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                saveScroll(urlKey, window.scrollY);
                ticking = false;
            });
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            saveScroll(urlKey, window.scrollY);
        };
    }, [urlKey]);

    useEffect(() => {
        didRestoreRef.current = false;
    }, [urlKey]);

    useEffect(() => {
        setLastSearchUrl(location.pathname + location.search);
    }, [location.pathname, location.search]);

    const loadMore = useCallback(() => {
        if (!query.trim()) return;
        if (loadingMoreLock.current) return;
        if (isLoadingInitial || isLoadingMore) return;
        if (errorInitial) return;
        if (!(items.length > 0 && items.length < numFound)) return;

        loadingMoreLock.current = true;
        setSearchParams({ q: query, page: String(page + 1) });
    }, [query, page, setSearchParams, isLoadingInitial, isLoadingMore, errorInitial, items.length, numFound]);

    const canLoadMore = items.length > 0 && items.length < numFound;
    const enableInfinite = canLoadMore && !isLoadingInitial && !isLoadingMore && !errorInitial && !errorMore;

    const sentinelRef = useInfiniteScroll({
        enabled: enableInfinite,
        onLoadMore: loadMore,
        rootMargin: "700px",
    });

    function retryInitial() {
        if (!query.trim()) return;
        setSearchParams({ q: query, page: "1", n: String(Date.now()) });
    }


    function retryMore() {
        if (!query.trim()) return;
        setSearchParams({ q: query, page: String(page), n: String(Date.now()) });
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Rechercher un livre</h1>
                    <p className="mt-1 text-sm text-zinc-600">
                        Recherche par titre, auteur ou sujet. Ajoute des favoris ❤️ et marque tes livres lus.
                    </p>
                </div>
            </div>


            <SearchBar initialValue={query} onSearch={runSearch} isLoading={isLoadingInitial} />

            <SearchHistory
                items={history}
                onPick={(q) => runSearch(q)}
                onClear={() => {
                    clearHistory();
                    setHistory([]);
                }}
            />

            {/* --- CONTENU PRINCIPAL --- */}
            {hasSearch ? (
                <>
                    {/* ✅ Tout ce qui concerne la recherche */}
                    {isLoadingInitial ? (
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                                    <div className="flex gap-4">
                                        <div className="h-28 w-20 rounded-xl bg-zinc-100 animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 rounded bg-zinc-100 animate-pulse" />
                                            <div className="h-3 w-1/2 rounded bg-zinc-100 animate-pulse" />
                                            <div className="h-3 w-1/3 rounded bg-zinc-100 animate-pulse" />
                                            <div className="h-7 w-24 rounded-xl bg-zinc-100 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {errorInitial ? (
                        <div className="mt-4">
                            <AlertCard
                                title="Impossible de charger les résultats"
                                action={
                                    <button
                                        onClick={retryInitial}
                                        className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 active:scale-[0.98]"
                                    >
                                        Réessayer
                                    </button>
                                }
                            >
                                {errorInitial}
                            </AlertCard>
                        </div>
                    ) : null}

                    {query && !isLoadingInitial && !errorInitial ? (
                        <div className="text-sm text-zinc-700">
                            Résultats pour <span className="font-semibold text-zinc-900">{query}</span>{" "}
                            <span className="text-zinc-500">— {numFound.toLocaleString()} trouvés</span>
                        </div>
                    ) : null}

                    {!isLoadingInitial ? <BookList items={items} /> : null}

                    {items.length === 0 && !isLoadingInitial && !errorInitial ? (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
                            Aucun résultat trouvé pour <span className="font-semibold text-zinc-900">{query}</span>.
                        </div>
                    ) : null}

                    <div ref={sentinelRef} className="h-px" />

                    {errorMore ? (
                        <div className="mt-4">
                            <AlertCard
                                title="Impossible de charger la suite"
                                action={
                                    <button
                                        onClick={retryMore}
                                        className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 active:scale-[0.98]"
                                    >
                                        Réessayer
                                    </button>
                                }
                            >
                                {errorMore}
                            </AlertCard>
                        </div>
                    ) : null}

                    {isLoadingMore ? (
                        <p className="mt-4 text-sm text-zinc-600" role="status" aria-live="polite">
                            Chargement de la suite…
                        </p>
                    ) : null}

                    {!isLoadingInitial && !isLoadingMore && !errorInitial && !errorMore && items.length > 0 && !canLoadMore ? (
                        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700 shadow-sm">
                            Fin des résultats.
                        </div>
                    ) : null}

                </>
            ) : (
                <>
                    {/* ✅ Tout ce qui concerne l'exploration par catégories */}
                    <div className="space-y-6">
                        {CATEGORIES.map((c, idx) => (
                            <div key={c.subject}>
                                <CategoryRow
                                    title={c.title}
                                    subject={c.subject}
                                    items={catData[c.subject] ?? []}
                                    isLoading={!!catLoading[c.subject]}
                                    error={catError[c.subject]}
                                    onSeeAll={(subj) => runSearch(subj.replaceAll("_", " "))}
                                />

                                {idx !== CATEGORIES.length - 1 ? (
                                    <div className="mt-8 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                                ) : null}
                            </div>
                        ))}
                    </div>
                </>
            )}


        </div>
    );
}
