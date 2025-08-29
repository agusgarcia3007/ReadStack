import { z } from "zod";

export const followUserSchema = z.object({
  userId: z.string().uuid(),
});

export const getFollowersSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const getFollowingSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const getSuggestionsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type FollowUserInput = z.infer<typeof followUserSchema>;
export type GetFollowersInput = z.infer<typeof getFollowersSchema>;
export type GetFollowingInput = z.infer<typeof getFollowingSchema>;
export type GetSuggestionsInput = z.infer<typeof getSuggestionsSchema>;
