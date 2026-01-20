const KEY = "book-explorer:search-history:v1";
const MAX = 10;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(items: string[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
}

export function addToHistory(query: string) {
  const q = query.trim();
  if (!q) return;

  const items = read().filter((x) => x.toLowerCase() !== q.toLowerCase());
  items.unshift(q);
  write(items);
}

export function getHistory(): string[] {
  return read();
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
