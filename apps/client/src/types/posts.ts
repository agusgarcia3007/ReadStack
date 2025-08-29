export interface Post {
  id: string;
  userId: string;
  content: string;
  postType: "quote" | "progress" | "review" | "thought" | "recommendation";
  bookId?: string;
  quoteText?: string;
  pageNumber?: number;
  progressPercentage?: number;
  rating?: number;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isPrivate: boolean;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    username?: string;
    profileImage?: string;
    isVerified: boolean;
  };
  book?: {
    id: string;
    title: string;
    authors: string[];
    thumbnail?: string;
  };
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  likesCount: number;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    username?: string;
    profileImage?: string;
    isVerified: boolean;
  };
}

export interface CreatePostData {
  content: string;
  postType: "quote" | "progress" | "review" | "thought" | "recommendation";
  bookId?: string;
  quoteText?: string;
  pageNumber?: number;
  progressPercentage?: number;
  rating?: number;
  imageUrl?: string;
  isPrivate?: boolean;
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

export interface FeedParams {
  limit?: number;
  offset?: number;
  type?: "following" | "discover";
}

export interface FeedResponse {
  posts: Post[];
  hasMore: boolean;
}

export interface CommentsResponse {
  comments: Comment[];
  hasMore: boolean;
}