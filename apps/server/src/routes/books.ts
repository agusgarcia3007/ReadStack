import { createEndpoint, createRouter } from "@/lib/endpoint-builder";
import {
  searchGoogleBooks,
  searchByISBN,
  getBooks,
  getBookById,
  addBookFromGoogle,
  createCustomBook,
} from "@/controllers/books";

export const booksRouter = createRouter([
  // Public endpoints - book search
  createEndpoint(
    { path: "/search", isPrivate: false },
    { GET: searchGoogleBooks }
  ),
  createEndpoint(
    { path: "/search/isbn/:isbn", isPrivate: false },
    { GET: searchByISBN }
  ),
  createEndpoint({ path: "/", isPrivate: false }, { GET: getBooks }),
  createEndpoint({ path: "/:id", isPrivate: false }, { GET: getBookById }),

  // Authenticated endpoints - book creation
  createEndpoint(
    { path: "/from-google", isPrivate: true },
    { POST: addBookFromGoogle }
  ),
  createEndpoint(
    { path: "/custom", isPrivate: true },
    { POST: createCustomBook }
  ),
]);
