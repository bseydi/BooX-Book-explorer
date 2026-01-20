const KEY = "book-explorer:last-clicked-workid:v1";

export function setLastClickedWorkId(workId: string) {
  try {
    sessionStorage.setItem(KEY, workId);
  } catch {}
}

export function getLastClickedWorkId() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearLastClickedWorkId() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
