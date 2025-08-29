import type { User } from "./users";

export interface FollowData {
  userId: string;
}

export interface FollowersParams {
  limit?: number;
  offset?: number;
}

export interface FollowersResponse {
  followers: Array<User & { createdAt: string }>;
  hasMore: boolean;
}

export interface FollowingResponse {
  following: Array<User & { createdAt: string }>;
  hasMore: boolean;
}

export interface SuggestionsParams {
  limit?: number;
}

export interface SuggestionsResponse {
  suggestions: User[];
}