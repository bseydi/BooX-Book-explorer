import type { BookSearchItem } from "../types/books";

const BASE = "https://openlibrary.org";

// ---- CACHE ----
type CacheEntry = { savedAt: number; items: BookSearchItem[] };
const mem = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<BookSearchItem[]>>();

function ssKey(subject: string, limit: number) {
  return `book-explorer:subject:v1:${subject}:${limit}`;
}

function readSS(subject: string, limit: number): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(ssKey(subject, limit));
    if (!raw) return null;
    const obj = JSON.parse(raw) as CacheEntry;
    if (!obj || typeof obj !== "object") return null;
    if (!Array.isArray(obj.items)) return null;
    if (typeof obj.savedAt !== "number") return null;
    return obj;
  } catch {
    return null;
  }
}

function writeSS(subject: string, limit: number, entry: CacheEntry) {
  try {
    sessionStorage.setItem(ssKey(subject, limit), JSON.stringify(entry));
  } catch {}
}

export function peekSubjectBooks(subject: string, limit: number): BookSearchItem[] | null {
  const k = ssKey(subject, limit);
  const inMem = mem.get(k);
  if (inMem) return inMem.items;

  const inSS = readSS(subject, limit);
  if (inSS) {
    mem.set(k, inSS);
    return inSS.items;
  }
  return null;
}

// ---- FETCH ----
// adapte ce type à ce que tu utilises déjà côté subjects
type SubjectResponse = {
  works?: Array<{
    key: string; // "/works/OLxxxW"
    title: string;
    authors?: Array<{ name: string }>;
    cover_id?: number;
    first_publish_year?: number;
  }>;
};

function mapSubjectToItems(json: SubjectResponse): BookSearchItem[] {
  const works = json.works ?? [];
  return works.map((w) => ({
    workId: w.key.replace("/works/", ""),
    title: w.title,
    authors: (w.authors ?? []).map((a) => a.name),
    coverId: w.cover_id,
    firstPublishYear: w.first_publish_year,
    // si tu as ratings sur BookSearchItem, tu peux les laisser undefined ici
  }));
}

export async function getSubjectBooks(subject: string, limit = 18, ttlMs = 6 * 60 * 60 * 1000) {
  const k = ssKey(subject, limit);

  // 1) mémoire
  const inMem = mem.get(k);
  if (inMem && Date.now() - inMem.savedAt < ttlMs) return inMem.items;

  // 2) sessionStorage
  const inSS = readSS(subject, limit);
  if (inSS && Date.now() - inSS.savedAt < ttlMs) {
    mem.set(k, inSS);
    return inSS.items;
  }

  // 3) dédupe requêtes en cours
  const running = inflight.get(k);
  if (running) return running;

  const p = (async () => {
    const url = new URL(`${BASE}/subjects/${subject}.json`);
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Erreur API Open Library (subjects)");

    const json = (await res.json()) as SubjectResponse;
    const items = mapSubjectToItems(json);

    const entry: CacheEntry = { savedAt: Date.now(), items };
    mem.set(k, entry);
    writeSS(subject, limit, entry);

    return items;
  })();

  inflight.set(k, p);
  try {
    return await p;
  } finally {
    inflight.delete(k);
  }
}
