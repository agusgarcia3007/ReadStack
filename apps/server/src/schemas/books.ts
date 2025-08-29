import { z } from "zod";

export const bookSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  maxResults: z.coerce.number().min(1).max(40).optional().default(10),
  startIndex: z.coerce.number().min(0).optional().default(0),
});

export const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
  isbn10: z.string().optional(),
  isbn13: z.string().optional(),
  categories: z.array(z.string()).default([]),
  pageCount: z.number().positive().optional(),
  language: z.string().default("unknown"),
});

export const addBookFromGoogleSchema = z.object({
  googleBooksId: z.string().min(1, "Google Books ID is required"),
  title: z.string().min(1),
  authors: z.array(z.string()),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
  isbn10: z.string().optional(),
  isbn13: z.string().optional(),
  thumbnail: z.string().optional(),
  categories: z.array(z.string()).default([]),
  pageCount: z.number().optional(),
  language: z.string().default("unknown"),
});

export type BookSearchParams = z.infer<typeof bookSearchSchema>;
export type CreateBookData = z.infer<typeof createBookSchema>;
export type AddBookFromGoogleData = z.infer<typeof addBookFromGoogleSchema>;
