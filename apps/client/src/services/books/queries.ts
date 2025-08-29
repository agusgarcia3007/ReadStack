import { useQuery } from "@tanstack/react-query";
import { BooksService } from "./service";

export const useSearchGoogleBooks = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["googleBooks", "search", query],
    queryFn: () => BooksService.searchGoogleBooks(query),
    enabled: enabled && query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBooks = (search?: string, limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ["books", search, limit, offset],
    queryFn: () => BooksService.getBooks(search, limit, offset),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};