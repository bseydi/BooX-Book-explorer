// src/services/workRatings.ts
const BASE = "https://openlibrary.org";

export type RatingResponse = {
  average?: number;
  count?: number;
  counts?: Record<string, number>;
  rating?: number; 
  rating_count?: number;
};

const mem = new Map<string, RatingResponse>();

function ssKey(workId: string) {
  return `book-explorer:ol-ratings:v1:${workId}`;
}

function readSS(workId: string): RatingResponse | null {
  try {
    const raw = sessionStorage.getItem(ssKey(workId));
    if (!raw) return null;
    const obj = JSON.parse(raw) as RatingResponse;
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

function writeSS(workId: string, data: RatingResponse) {
  try {
    sessionStorage.setItem(ssKey(workId), JSON.stringify(data));
  } catch {}
}

export async function getWorkRating(workId: string): Promise<RatingResponse> {
  // 1) mémoire
  const inMem = mem.get(workId);
  if (inMem) return inMem;

  // 2) sessionStorage
  const inSS = readSS(workId);
  if (inSS) {
    mem.set(workId, inSS);
    return inSS;
  }

  // 3) réseau — ✅ bon endpoint
  try {
    const res = await fetch(`${BASE}/works/${workId}/ratings.json`);
    if (!res.ok) throw new Error("Ratings fetch failed");
    const json = await res.json();

    const data: RatingResponse = {
      average: typeof json?.summary?.average === "number" ? json.summary.average : undefined,
      count: typeof json?.summary?.count === "number" ? json.summary.count : undefined,
      counts: typeof json?.counts === "object" && json.counts ? json.counts : undefined,
    };

    mem.set(workId, data);
    writeSS(workId, data);
    return data;
  } catch {
    const fallback: RatingResponse = {};
    mem.set(workId, fallback);
    writeSS(workId, fallback);
    return fallback;
  }
}
