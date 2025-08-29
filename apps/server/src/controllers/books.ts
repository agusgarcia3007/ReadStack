import { Context, Handler } from "hono";
import { db } from "@/db";
import { books } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { AuthenticatedContext } from "@/lib/endpoint-builder";
import { uploadFile } from "@/lib/minio";
import { searchBooks, searchBooksByISBN } from "@/lib/google-books";
import {
  bookSearchSchema,
  createBookSchema,
  addBookFromGoogleSchema,
} from "@/schemas/books";

// Search books from Google Books API
export const searchGoogleBooks = async (c: Context) => {
  const query = c.req.query("q");
  const maxResults = parseInt(c.req.query("maxResults") || "10");
  const startIndex = parseInt(c.req.query("startIndex") || "0");

  const parsed = bookSearchSchema.safeParse({
    query,
    maxResults,
    startIndex,
  });

  if (!parsed.success) {
    return c.json(
      { message: "Invalid search parameters", errors: parsed.error.issues },
      400
    );
  }

  try {
    const results = await searchBooks(
      parsed.data.query,
      parsed.data.maxResults,
      parsed.data.startIndex
    );

    return c.json({
      success: true,
      data: results,
      total: results.length,
    });
  } catch (error) {
    console.error("Error searching Google Books:", error);
    return c.json(
      { message: "Failed to search books", error: (error as Error).message },
      500
    );
  }
};

// Search books by ISBN
export const searchByISBN = async (c: Context) => {
  const isbn = c.req.param("isbn");

  if (!isbn) {
    return c.json({ message: "ISBN is required" }, 400);
  }

  try {
    const result = await searchBooksByISBN(isbn);

    if (!result) {
      return c.json({ message: "Book not found" }, 404);
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error searching by ISBN:", error);
    return c.json(
      { message: "Failed to search by ISBN", error: (error as Error).message },
      500
    );
  }
};

// Add book from Google Books to database
export const addBookFromGoogle: Handler = async (c) => {
  const user = (c as AuthenticatedContext).get("user");
  const body = await c.req.json();
  const parsed = addBookFromGoogleSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { message: "Invalid request body", errors: parsed.error.issues },
      400
    );
  }

  const userId = user.id;

  try {
    // Check if book already exists by Google Books ID
    const existingBook = await db
      .select()
      .from(books)
      .where(eq(books.googleBooksId, parsed.data.googleBooksId))
      .limit(1);

    if (existingBook.length > 0) {
      return c.json({
        success: true,
        data: existingBook[0],
        message: "Book already exists in database",
      });
    }

    const [book] = await db
      .insert(books)
      .values({
        ...parsed.data,
        createdBy: userId,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: book,
        message: "Book added successfully",
      },
      201
    );
  } catch (error) {
    console.error("Error adding book from Google:", error);
    return c.json(
      { message: "Failed to add book", error: (error as Error).message },
      500
    );
  }
};

// Create custom book with image upload
export const createCustomBook: Handler = async (c) => {
  const user = (c as AuthenticatedContext).get("user");
  try {
    const formData = await c.req.formData();
    const userId = user.id;

    // Extract form fields
    const title = formData.get("title") as string;
    const authors = JSON.parse((formData.get("authors") as string) || "[]");
    const publisher = formData.get("publisher") as string;
    const publishedDate = formData.get("publishedDate") as string;
    const description = formData.get("description") as string;
    const isbn10 = formData.get("isbn10") as string;
    const isbn13 = formData.get("isbn13") as string;
    const categories = JSON.parse(
      (formData.get("categories") as string) || "[]"
    );
    const pageCount = formData.get("pageCount")
      ? parseInt(formData.get("pageCount") as string)
      : undefined;
    const language = (formData.get("language") as string) || "unknown";
    const coverImage = formData.get("coverImage") as File;

    // Validate required fields
    const parsed = createBookSchema.safeParse({
      title,
      authors,
      publisher,
      publishedDate,
      description,
      isbn10,
      isbn13,
      categories,
      pageCount,
      language,
    });

    if (!parsed.success) {
      return c.json(
        { message: "Invalid book data", errors: parsed.error.issues },
        400
      );
    }

    let coverImageUrl: string | null = null;

    // Upload cover image if provided
    if (coverImage && coverImage instanceof File && coverImage.size > 0) {
      const buffer = Buffer.from(await coverImage.arrayBuffer());

      // Validate file type
      if (!coverImage.type.startsWith("image/")) {
        return c.json({ message: "Cover image must be an image file" }, 400);
      }

      // Upload to MinIO
      coverImageUrl = await uploadFile(
        buffer,
        coverImage.name,
        coverImage.type,
        {
          "book-title": title,
          "uploaded-by": userId,
        }
      );
    }

    // Create book in database
    const [book] = await db
      .insert(books)
      .values({
        ...parsed.data,
        coverImage: coverImageUrl,
        createdBy: userId,
      })
      .returning();

    return c.json(
      {
        success: true,
        data: book,
        message: "Custom book created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Error creating custom book:", error);
    return c.json(
      { message: "Failed to create book", error: (error as Error).message },
      500
    );
  }
};

// Get all books (with search functionality)
export const getBooks = async (c: Context) => {
  const search = c.req.query("search");
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = parseInt(c.req.query("offset") || "0");

  try {
    const baseQuery = db.select().from(books);

    const query = search
      ? baseQuery.where(
          or(
            ilike(books.title, `%${search}%`),
            ilike(books.authors, `%${search}%`),
            ilike(books.publisher, `%${search}%`)
          )
        )
      : baseQuery;

    const results = await query
      .limit(limit)
      .offset(offset)
      .orderBy(books.createdAt);

    return c.json({
      success: true,
      data: results,
      pagination: {
        limit,
        offset,
        total: results.length,
      },
    });
  } catch (error) {
    console.error("Error getting books:", error);
    return c.json(
      { message: "Failed to get books", error: (error as Error).message },
      500
    );
  }
};

// Get book by ID
export const getBookById = async (c: Context) => {
  const bookId = c.req.param("id");

  try {
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return c.json({ message: "Book not found" }, 404);
    }

    return c.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Error getting book:", error);
    return c.json(
      { message: "Failed to get book", error: (error as Error).message },
      500
    );
  }
};
