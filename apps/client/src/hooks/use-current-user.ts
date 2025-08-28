import { LS_AUTH_KEYS } from "@/lib/constants";
import type { User } from "@/types/auth";
import { useMemo } from "react";

const { USER } = LS_AUTH_KEYS;

export function useCurrentUser() {
  const user = useMemo(() => {
    const storedUser = localStorage.getItem(USER);
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as User;
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        return null;
      }
    }
    return null;
  }, []);

  return user;
}