import type { BookSearchItem } from "../types/books";

const BASE = "https://openlibrary.org";

type SubjectWork = {
  key: string; // "/works/OLxxxxW"
  title: string;
  authors?: { name: string }[];
  cover_id?: number;
  first_publish_year?: number;
};

type SubjectResponse = {
  works: SubjectWork[];
};

function workKeyToId(key: string) {
  // "/works/OL123W" -> "OL123W"
  return key.split("/").pop() ?? key;
}

export async function getSubjectBooks(subject: string, limit = 20): Promise<BookSearchItem[]> {
  const url = `${BASE}/subjects/${encodeURIComponent(subject)}.json?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erreur API subject");
  const data = (await res.json()) as SubjectResponse;

  return (data.works ?? []).map((w) => ({
    workId: workKeyToId(w.key),
    title: w.title,
    authors: (w.authors ?? []).map((a) => a.name),
    coverId: w.cover_id,
    firstPublishYear: w.first_publish_year,
  }));
}
