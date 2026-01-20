import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BookSearchItem } from "../types/books";

const KEY = "book-explorer:read:v1";

type ReadEntry = BookSearchItem;

type Ctx = {
  read: ReadEntry[];
  isRead: (workId: string) => boolean;
  toggleRead: (book: BookSearchItem) => void;
};

const ReadingContext = createContext<Ctx | null>(null);

function readStorage(): ReadEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReadEntry[]) : [];
  } catch {
    return [];
  }
}

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [read, setRead] = useState<ReadEntry[]>(() => readStorage());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(read));
  }, [read]);

  const value = useMemo<Ctx>(() => {
    function isRead(workId: string) {
      return read.some((b) => b.workId === workId);
    }

    function toggleRead(book: BookSearchItem) {
      setRead((prev) =>
        prev.some((b) => b.workId === book.workId)
          ? prev.filter((b) => b.workId !== book.workId)
          : [...prev, book]
      );
    }

    return { read, isRead, toggleRead };
  }, [read]);

  return <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>;
}

export function useReading() {
  const ctx = useContext(ReadingContext);
  if (!ctx) throw new Error("useReading must be used within ReadingProvider");
  return ctx;
}
