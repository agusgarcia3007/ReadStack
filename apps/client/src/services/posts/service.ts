import { http } from "@/lib/http";
import type {
  CreatePostData,
  CreateCommentData,
  CommentsResponse,
  Post,
  Comment,
} from "@/types/posts";

export class PostsService {
  public static async createPost(payload: CreatePostData): Promise<{ post: Post }> {
    const { data } = await http.post("/posts", payload);
    return data;
  }

  public static async likePost(postId: string): Promise<{ message: string }> {
    const { data } = await http.post(`/posts/${postId}/like`);
    return data;
  }

  public static async unlikePost(postId: string): Promise<{ message: string }> {
    const { data } = await http.delete(`/posts/${postId}/like`);
    return data;
  }

  public static async getPostComments(
    postId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<CommentsResponse> {
    const { data } = await http.get(`/posts/${postId}/comments`, { params });
    return data;
  }

  public static async addComment(
    postId: string,
    payload: CreateCommentData
  ): Promise<{ comment: Comment }> {
    const { data } = await http.post(`/posts/${postId}/comments`, payload);
    return data;
  }
}