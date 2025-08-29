export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  bio?: string;
  profileImage?: string;
  location?: string;
  website?: string;
  readingGoal?: number;
  booksReadCount?: number;
  followersCount?: number;
  followingCount?: number;
  isVerified?: boolean;
  createdAt: string;
}

export interface UserProfile extends User {
  updatedAt: string;
}

export interface UpdateProfileData {
  username?: string;
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  readingGoal?: number;
}

export interface SearchUsersParams {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchUsersResponse {
  users: User[];
  hasMore: boolean;
}