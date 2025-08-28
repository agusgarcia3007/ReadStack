import axios from "axios";
import { LS_AUTH_KEYS } from "./constants";
import { AuthService } from "@/services/auth/service";

const { TOKEN, USER } = LS_AUTH_KEYS;

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AuthService.logout();
      } catch {
        localStorage.removeItem(TOKEN);
        localStorage.removeItem(USER);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
