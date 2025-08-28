import { catchAxiosError } from "@/lib/utils";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
} from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthService } from "./service";
import { LS_AUTH_KEYS } from "@/lib/constants";

const { TOKEN, USER } = LS_AUTH_KEYS;

export const useSignup = () => {
  return useMutation({
    mutationFn: (payload: SignupPayload) => AuthService.signup(payload),
    onError: catchAxiosError,
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem(TOKEN, data.token);
      localStorage.setItem(USER, JSON.stringify(data.user));
      window.location.href = "/dashboard";
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => AuthService.login(payload),
    onError: catchAxiosError,
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem(TOKEN, data.token);
      localStorage.setItem(USER, JSON.stringify(data.user));
      window.location.href = "/dashboard";
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => AuthService.logout(),
    onError: catchAxiosError,
    onSuccess: () => {
      localStorage.removeItem(TOKEN);
      localStorage.removeItem(USER);
      window.location.href = "/login";
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      AuthService.forgotPassword(payload),
    onError: catchAxiosError,
    onSuccess: () => {
      toast.success("Email de recuperación enviado");
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      AuthService.resetPassword(payload),
    onError: catchAxiosError,
    onSuccess: () => {
      window.location.href = "/login";
    },
  });
};
