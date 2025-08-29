import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  postType: z.enum([
    "quote",
    "progress",
    "review",
    "thought",
    "recommendation",
  ]),
  bookId: z.string().uuid().optional(),
  quoteText: z.string().max(1000).optional(),
  pageNumber: z.number().min(1).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  rating: z.number().min(1).max(5).optional(),
  imageUrl: z.string().url().optional(),
  isPrivate: z.boolean().default(false),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  isPrivate: z.boolean().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
  parentCommentId: z.string().uuid().optional(),
});

export const getFeedSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
  type: z.enum(["following", "discover"]).default("following"),
});

export const getPostCommentsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type GetFeedInput = z.infer<typeof getFeedSchema>;
export type GetPostCommentsInput = z.infer<typeof getPostCommentsSchema>;
