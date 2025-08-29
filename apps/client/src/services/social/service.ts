import { http } from "@/lib/http";
import type {
  FollowData,
  FollowersParams,
  FollowersResponse,
  FollowingResponse,
  SuggestionsParams,
  SuggestionsResponse,
} from "@/types/social";

export class SocialService {
  public static async followUser(payload: FollowData): Promise<{ message: string }> {
    const { data } = await http.post("/social/follow", payload);
    return data;
  }

  public static async unfollowUser(userId: string): Promise<{ message: string }> {
    const { data } = await http.delete(`/social/follow/${userId}`);
    return data;
  }

  public static async getFollowers(
    userId: string,
    params: FollowersParams
  ): Promise<FollowersResponse> {
    const { data } = await http.get(`/social/followers/${userId}`, { params });
    return data;
  }

  public static async getFollowing(
    userId: string,
    params: FollowersParams
  ): Promise<FollowingResponse> {
    const { data } = await http.get(`/social/following/${userId}`, { params });
    return data;
  }

  public static async getSuggestions(
    params: SuggestionsParams
  ): Promise<SuggestionsResponse> {
    const { data } = await http.get("/social/suggestions", { params });
    return data;
  }
}