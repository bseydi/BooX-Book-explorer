export type BookSearchItem = {
  workId: string;
  title: string;
  authors: string[];
  coverId?: number;
  firstPublishYear?: number;
  ratingsAverage?: number;
  ratingsCount?: number;
};



export type BookSearchResponse = {
  items: BookSearchItem[];
  numFound: number;
};

export type WorkDetail = {
  workId: string;
  title: string;
  description?: string;
  subjects: string[];
  covers: number[]; // cover ids
  authors: { name: string; authorId: string }[];
};

export type AuthorDetail = {
  authorId: string;
  name: string;
  bio?: string;
};
