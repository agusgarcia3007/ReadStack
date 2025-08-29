import { http } from "@/lib/http";

export interface GoogleBookResult {
  googleBooksId: string;
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  isbn10?: string;
  isbn13?: string;
  thumbnail?: string;
  pageCount?: number;
  categories?: string[];
  language?: string;
}

export interface BookSearchResponse {
  success: boolean;
  data: GoogleBookResult[];
  total: number;
}

export interface Book {
  id: string;
  googleBooksId?: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  isbn10?: string;
  isbn13?: string;
  thumbnail?: string;
  coverImage?: string;
  categories: string[];
  pageCount?: number;
  language: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BooksResponse {
  success: boolean;
  data: Book[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export class BooksService {
  public static async searchGoogleBooks(
    query: string,
    maxResults: number = 10,
    startIndex: number = 0
  ): Promise<BookSearchResponse> {
    const { data } = await http.get("/books/search", {
      params: { q: query, maxResults, startIndex },
    });
    return data;
  }

  public static async getBooks(
    search?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<BooksResponse> {
    const { data } = await http.get("/books", {
      params: { search, limit, offset },
    });
    return data;
  }

  public static async getBookById(id: string): Promise<{ success: boolean; data: Book }> {
    const { data } = await http.get(`/books/${id}`);
    return data;
  }

  public static async addBookFromGoogle(
    bookData: GoogleBookResult
  ): Promise<{ success: boolean; data: Book; message: string }> {
    const { data } = await http.post("/books/from-google", bookData);
    return data;
  }
}