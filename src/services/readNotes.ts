const KEY = "book-explorer:read-notes:v1";

type NotesDB = Record<string, string>; // workId -> note

function readDB(): NotesDB {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as NotesDB) : {};
  } catch {
    return {};
  }
}

function writeDB(db: NotesDB) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function getNote(workId: string): string {
  const db = readDB();
  return db[workId] ?? "";
}

export function setNote(workId: string, note: string) {
  const db = readDB();
  db[workId] = note;
  writeDB(db);
}

export function removeNote(workId: string) {
  const db = readDB();
  delete db[workId];
  writeDB(db);
}
