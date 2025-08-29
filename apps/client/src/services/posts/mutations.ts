import { useMutation, useQueryClient } from "@tanstack/react-query";
import { catchAxiosError } from "@/lib/utils";
import { PostsService } from "./service";
import type { CreatePostData, CreateCommentData } from "@/types/posts";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => PostsService.createPost(data),
    onSuccess: () => {
      // Invalidate feed queries to show new post
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: catchAxiosError,
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => PostsService.likePost(postId),
    onSuccess: () => {
      // Invalidate feed to update like count
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: catchAxiosError,
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => PostsService.unlikePost(postId),
    onSuccess: () => {
      // Invalidate feed to update like count
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: catchAxiosError,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CreateCommentData }) =>
      PostsService.addComment(postId, data),
    onSuccess: (_, variables) => {
      // Invalidate comments for this post and feed to update comment count
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: catchAxiosError,
  });
};