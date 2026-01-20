const KEY = "book-explorer:read-prefs:v1";

export type ReadPrefs = {
  sort: "recent" | "title-asc" | "title-desc" | "rating-desc" | "rating-asc";
  minRating: number; // 0..5
};

const DEFAULTS: ReadPrefs = { sort: "rating-desc", minRating: 0 };

export function getReadPrefs(): ReadPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ReadPrefs>;

    const sort = parsed.sort ?? DEFAULTS.sort;
    const minRating = typeof parsed.minRating === "number" ? parsed.minRating : DEFAULTS.minRating;

    return {
      sort,
      minRating: Math.max(0, Math.min(5, Math.floor(minRating))),
    };
  } catch {
    return DEFAULTS;
  }
}

export function setReadPrefs(next: ReadPrefs) {
  const clean: ReadPrefs = {
    sort: next.sort,
    minRating: Math.max(0, Math.min(5, Math.floor(next.minRating))),
  };
  localStorage.setItem(KEY, JSON.stringify(clean));
}
