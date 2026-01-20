const KEY = "book-explorer:read-ratings:v1";

type RatingsDB = Record<string, number>; // workId -> 1..5

function readDB(): RatingsDB {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RatingsDB) : {};
  } catch {
    return {};
  }
}

function writeDB(db: RatingsDB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function getRating(workId: string): number {
  const db = readDB();
  const v = db[workId];
  return typeof v === "number" ? v : 0;
}

export function setRating(workId: string, rating: number) {
  const r = Math.max(0, Math.min(5, Math.floor(rating)));
  const db = readDB();
  if (r === 0) delete db[workId];
  else db[workId] = r;
  writeDB(db);
}

export function removeRating(workId: string) {
  const db = readDB();
  delete db[workId];
  writeDB(db);
}
