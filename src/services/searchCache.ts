import type { BookSearchItem } from "../types/books";

const KEY = "book-explorer:search-cache:v2";
const MAX_ENTRIES = 50;
const TTL_MS = 30 * 60 * 1000; // 30 min

type CacheEntry = {
  q: string;
  page: number;
  items: BookSearchItem[];
  numFound: number;
  ts: number; // timestamp
};

type CacheDB = {
  entries: CacheEntry[];
};

function loadDB(): CacheDB {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return { entries: [] };
    const parsed = JSON.parse(raw) as CacheDB;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

function saveDB(db: CacheDB) {
  sessionStorage.setItem(KEY, JSON.stringify(db));
}

function now() {
  return Date.now();
}

function normalizeQ(q: string) {
  return q.trim().toLowerCase();
}

function prune(db: CacheDB) {
  const t = now();
  db.entries = db.entries.filter((e) => t - e.ts <= TTL_MS);

  // garder le plus récent en premier
  db.entries.sort((a, b) => b.ts - a.ts);
  db.entries = db.entries.slice(0, MAX_ENTRIES);
}

export function getCachedPage(q: string, page: number) {
  const db = loadDB();
  prune(db);
  const nq = normalizeQ(q);

  const entry = db.entries.find((e) => e.q === nq && e.page === page);
  if (!entry) return null;

  // refresh LRU
  entry.ts = now();
  saveDB(db);

  return { items: entry.items, numFound: entry.numFound };
}

export function setCachedPage(q: string, page: number, items: BookSearchItem[], numFound: number) {
  const db = loadDB();
  prune(db);

  const nq = normalizeQ(q);
  db.entries = db.entries.filter((e) => !(e.q === nq && e.page === page));
  db.entries.unshift({ q: nq, page, items, numFound, ts: now() });

  prune(db);
  saveDB(db);
}

export function clearSearchCache() {
  sessionStorage.removeItem(KEY);
}
