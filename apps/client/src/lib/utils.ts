import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

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
