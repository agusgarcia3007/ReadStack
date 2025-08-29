import { useMutation, useQueryClient } from "@tanstack/react-query";
import { catchAxiosError } from "@/lib/utils";
import { BooksService } from "./service";
import type { GoogleBookResult } from "./service";

export const useAddBookFromGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookData: GoogleBookResult) => BooksService.addBookFromGoogle(bookData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: catchAxiosError,
  });
};

export const useCreateCustomBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => BooksService.createCustomBook(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: catchAxiosError,
  });
};