import { http } from "@/lib/http";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  MessageResponse,
  ResetPasswordPayload,
  SignupPayload,
} from "@/types/auth";

export class AuthService {
  public static async signup(payload: SignupPayload): Promise<AuthResponse> {
    const { data } = await http.post("/auth/signup", payload);
    return data;
  }
  public static async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await http.post("/auth/login", payload);
    return data;
  }
  public static async logout(): Promise<MessageResponse> {
    const { data } = await http.post("/auth/logout");
    return data;
  }
  public static async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<MessageResponse> {
    const { data } = await http.post("/auth/forgot-password", payload);
    return data;
  }
  public static async resetPassword(
    payload: ResetPasswordPayload
  ): Promise<MessageResponse> {
    const { data } = await http.post("/auth/reset-password", payload);
    return data;
  }
}
