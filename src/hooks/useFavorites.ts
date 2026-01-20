import { useEffect, useState } from "react";
import type { BookSearchItem } from "../types/books";

const STORAGE_KEY = "book-explorer:favorites";

function readStorage(): BookSearchItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookSearchItem[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<BookSearchItem[]>(readStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function isFavorite(workId: string) {
    return favorites.some((b) => b.workId === workId);
  }

  function addFavorite(book: BookSearchItem) {
    setFavorites((prev) =>
      prev.some((b) => b.workId === book.workId) ? prev : [...prev, book]
    );
  }

  function removeFavorite(workId: string) {
    setFavorites((prev) => prev.filter((b) => b.workId !== workId));
  }

  function toggleFavorite(book: BookSearchItem) {
    setFavorites((prev) => {
      const exists = prev.some((b) => b.workId === book.workId);
      return exists ? prev.filter((b) => b.workId !== book.workId) : [...prev, book];
    });
  }

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
