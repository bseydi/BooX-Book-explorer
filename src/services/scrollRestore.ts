const PREFIX = "book-explorer:scroll:";

function keyFromUrl(url: string) {
  // on garde la query string, ça permet un scroll différent selon la recherche/page
  return PREFIX + url;
}

export function saveScroll(url: string, scrollY: number) {
  try {
    sessionStorage.setItem(keyFromUrl(url), String(scrollY));
  } catch {
    // ignore
  }
}

export function restoreScroll(url: string): number | null {
  try {
    const raw = sessionStorage.getItem(keyFromUrl(url));
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
