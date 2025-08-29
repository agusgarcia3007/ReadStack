// Google Books API integration for book search
export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
    imageLinks?: {
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
    categories?: string[];
    pageCount?: number;
    language?: string;
  };
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBookVolume[];
}

export interface BookSearchResult {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  isbn10?: string;
  isbn13?: string;
  thumbnail?: string;
  categories: string[];
  pageCount?: number;
  language: string;
}

export async function searchBooks(
  query: string,
  maxResults: number = 10,
  startIndex: number = 0
): Promise<BookSearchResult[]> {
  try {
    const apiKey = Bun.env.GOOGLE_BOOKS_API_KEY;
    const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
    
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      startIndex: startIndex.toString(),
      ...(apiKey && { key: apiKey }),
    });

    const response = await fetch(`${baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksResponse = await response.json();
    
    if (!data.items) {
      return [];
    }

    return data.items.map(transformGoogleBook);
  } catch (error) {
    console.error('Error searching Google Books:', error);
    return [];
  }
}

export async function searchBooksByISBN(isbn: string): Promise<BookSearchResult | null> {
  const results = await searchBooks(`isbn:${isbn}`, 1);
  return results[0] || null;
}

export async function searchBooksByTitle(title: string, maxResults: number = 10): Promise<BookSearchResult[]> {
  return searchBooks(`intitle:"${title}"`, maxResults);
}

export async function searchBooksByAuthor(author: string, maxResults: number = 10): Promise<BookSearchResult[]> {
  return searchBooks(`inauthor:"${author}"`, maxResults);
}

function transformGoogleBook(volume: GoogleBookVolume): BookSearchResult {
  const { volumeInfo } = volume;
  
  // Extract ISBN numbers
  const isbn10 = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === 'ISBN_10'
  )?.identifier;
  const isbn13 = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === 'ISBN_13'
  )?.identifier;

  return {
    id: volume.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors || [],
    publisher: volumeInfo.publisher,
    publishedDate: volumeInfo.publishedDate,
    description: volumeInfo.description,
    isbn10,
    isbn13,
    thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
    categories: volumeInfo.categories || [],
    pageCount: volumeInfo.pageCount,
    language: volumeInfo.language || 'unknown',
  };
}