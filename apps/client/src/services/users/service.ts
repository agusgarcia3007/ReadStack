import { http } from "@/lib/http";
import type {
  UserProfile,
  UpdateProfileData,
  SearchUsersParams,
  SearchUsersResponse,
} from "@/types/users";

export class UsersService {
  public static async getProfile(): Promise<{ profile: UserProfile }> {
    const { data } = await http.get("/users/profile");
    return data;
  }

  public static async updateProfile(
    payload: UpdateProfileData
  ): Promise<{ profile: UserProfile }> {
    const { data } = await http.put("/users/profile", payload);
    return data;
  }

  public static async getUserByUsername(
    username: string
  ): Promise<{ profile: UserProfile }> {
    const { data } = await http.get(`/users/${username}`);
    return data;
  }

  public static async searchUsers(
    params: SearchUsersParams
  ): Promise<SearchUsersResponse> {
    const { data } = await http.get("/users/search", { params });
    return data;
  }
}