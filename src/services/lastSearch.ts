const KEY = "book-explorer:last-search-url:v1";

export function setLastSearchUrl(url: string) {
  try {
    sessionStorage.setItem(KEY, url);
  } catch {
    // ignore
  }
}

export function getLastSearchUrl() {
  try {
    return sessionStorage.getItem(KEY) || "/";
  } catch {
    return "/";
  }
}
