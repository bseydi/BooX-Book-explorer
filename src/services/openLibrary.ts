import type { BookSearchItem, BookSearchResponse, AuthorDetail, WorkDetail } from "../types/books";

const BASE = "https://openlibrary.org";

type OpenLibrarySearchDoc = {
  key: string; // "/works/OL82563W"
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  ratings_average?: number;
  ratings_count?: number;
};

type OpenLibrarySearchApiResponse = {
  numFound: number;
  docs: OpenLibrarySearchDoc[];
};

type OpenLibraryWorkResponse = {
  title: string;
  description?: string | { value: string };
  subjects?: string[];
  covers?: number[];
  authors?: { author: { key: string } }[];
  first_publish_date?: string;
};


type OpenLibraryAuthorResponse = {
  name: string;
  bio?: string | { value: string };
};

export async function searchBooks(
  query: string,
  page: number,
): Promise<BookSearchResponse> {
  const q = query.trim();
  if (!q) return { items: [], numFound: 0 };

  const url = new URL(`${BASE}/search.json`);
  url.searchParams.set("q", q);
  url.searchParams.set("page", String(page));
  url.searchParams.set(
    "fields",
    [
      "key",
      "title",
      "author_name",
      "first_publish_year",
      "cover_i",
      "ratings_average",
      "ratings_count",
    ].join(",")
  );

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Erreur API Open Library");

  const data = (await res.json()) as OpenLibrarySearchApiResponse;

  const items: BookSearchItem[] = data.docs.map((d) => ({
    workId: d.key.replace("/works/", ""),
    title: d.title,
    authors: d.author_name ?? [],
    firstPublishYear: d.first_publish_year,
    coverId: d.cover_i,

    ratingsAverage: typeof d.ratings_average === "number" ? d.ratings_average : undefined,
    ratingsCount: typeof d.ratings_count === "number" ? d.ratings_count : undefined,
  }));

  return { items, numFound: data.numFound };
}

function asText(v?: string | { value: string }) {
  if (!v) return undefined;
  return typeof v === "string" ? v : v.value;
}

export async function getWork(workId: string): Promise<WorkDetail> {
  const res = await fetch(`https://openlibrary.org/works/${workId}.json`);
  if (!res.ok) throw new Error("Impossible de charger la fiche du livre");

  const data = (await res.json()) as OpenLibraryWorkResponse;

  const authorIds =
    data.authors?.map((a) => a.author.key.replace("/authors/", "")) ?? [];


  return {
    workId,
    title: data.title,
    description: asText(data.description),
    subjects: data.subjects ?? [],
    covers: data.covers ?? [],
    authors: authorIds.map((id) => ({ authorId: id, name: "…" })),
  };
}


export async function getAuthor(authorId: string): Promise<AuthorDetail> {
  const res = await fetch(`https://openlibrary.org/authors/${authorId}.json`);
  if (!res.ok) throw new Error("Impossible de charger l'auteur");

  const data = (await res.json()) as OpenLibraryAuthorResponse;

  return {
    authorId,
    name: data.name,
    bio: asText(data.bio),
  };
}

export function coverUrl(coverId: number, size: "S" | "M" | "L" = "M") {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
