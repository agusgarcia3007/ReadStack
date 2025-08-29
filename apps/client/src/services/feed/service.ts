import { http } from "@/lib/http";
import type { FeedParams, FeedResponse } from "@/types/posts";

export class FeedService {
  public static async getFeed(params: FeedParams): Promise<FeedResponse> {
    const { data } = await http.get("/feed", { params });
    return data;
  }
}