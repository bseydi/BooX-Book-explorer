import { http, HttpResponse } from "msw";

const BASE = "https://openlibrary.org";

export const handlers = [
  // search
  http.get(`${BASE}/search.json`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const page = Number(url.searchParams.get("page") ?? "1");

    if (!q.trim()) {
      return HttpResponse.json({ numFound: 0, docs: [] });
    }

    // mini dataset
    const docs = Array.from({ length: 3 }).map((_, i) => ({
      key: `/works/OL${page}${i}W`,
      title: `${q} book ${page}.${i}`,
      author_name: ["Frank Herbert"],
      first_publish_year: 1965,
      cover_i: 123,
    }));

    return HttpResponse.json({ numFound: 6, docs });
  }),

  // work detail
  http.get(`${BASE}/works/:workId.json`, ({ params }) => {
    const { workId } = params as { workId: string };
    return HttpResponse.json({
      title: `Work ${workId}`,
      description: { value: "A sci-fi classic." },
      subjects: ["Science fiction", "Desert planet"],
      covers: [123],
      authors: [{ author: { key: "/authors/OL1A" } }],
      first_publish_date: "1965",
    });
  }),

  // author
  http.get(`${BASE}/authors/:authorId.json`, ({ params }) => {
    const { authorId } = params as { authorId: string };
    return HttpResponse.json({ name: `Author ${authorId}` });
  }),

  // ratings.json (si tu utilises /ratings.json)
  http.get(`${BASE}/works/:workId/ratings.json`, () => {
    return HttpResponse.json({
      summary: { average: 4.2, count: 1200 },
      counts: { "5": 600, "4": 400, "3": 120, "2": 50, "1": 30 },
    });
  }),

  // editions fallback (si tu l'as ajouté)
  http.get(`${BASE}/works/:workId/editions.json`, () => {
    return HttpResponse.json({
      entries: [{ publish_date: "1965" }],
    });
  }),
];
