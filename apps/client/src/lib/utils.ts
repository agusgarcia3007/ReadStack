import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { useCallback, useRef } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function catchAxiosError(error: unknown) {
  let errorMessage = "Ha ocurrido un error inesperado";
  if (axios.isAxiosError(error)) {
    errorMessage = error.response?.data.message || errorMessage;
  }
  return toast.error(errorMessage);
}

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay) as NodeJS.Timeout;
    },
    [callback, delay]
  );

  return debouncedCallback;
}
