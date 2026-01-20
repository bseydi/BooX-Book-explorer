import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BookSearchItem } from "../types/books";

const STORAGE_KEY = "book-explorer:favorites";

type FavoritesContextValue = {
    favorites: BookSearchItem[];
    isFavorite: (workId: string) => boolean;
    addFavorite: (book: BookSearchItem) => void;
    removeFavorite: (workId: string) => void;
    toggleFavorite: (book: BookSearchItem) => void;
    clearFavorites: () => void;

};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readStorage(): BookSearchItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as BookSearchItem[]) : [];
    } catch {
        return [];
    }
}

function uniqByWorkId(items: BookSearchItem[]) {
    const map = new Map<string, BookSearchItem>();
    for (const it of items) map.set(it.workId, it);
    return Array.from(map.values());
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<BookSearchItem[]>(() => readStorage());

    // Persistance
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]);

    // (Optionnel mais bien) synchro si localStorage change (ex: autre onglet)
    useEffect(() => {
        function onStorage(e: StorageEvent) {
            if (e.key === STORAGE_KEY) setFavorites(readStorage());
        }
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const value = useMemo<FavoritesContextValue>(() => {
        function isFavorite(workId: string) {
            return favorites.some((b) => b.workId === workId);
        }

        function addFavorite(book: BookSearchItem) {
            setFavorites((prev) => uniqByWorkId([...prev, book]));
        }

        function removeFavorite(workId: string) {
            setFavorites((prev) => prev.filter((b) => b.workId !== workId));
        }

        function toggleFavorite(book: BookSearchItem) {
            setFavorites((prev) => {
                const exists = prev.some((b) => b.workId === book.workId);
                return exists ? prev.filter((b) => b.workId !== book.workId) : uniqByWorkId([...prev, book]);
            });
        }

        function clearFavorites() {
            setFavorites([]);
        }


        return { favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites };
    }, [favorites]);

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
    return ctx;
}
