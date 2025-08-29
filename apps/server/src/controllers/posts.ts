import { Context } from "hono";
import { db } from "@/db";
import {
  users,
  posts,
  books,
  postLikes,
  postComments,
  follows,
} from "@/db/schema";
import { eq, and, desc, sql, or, isNull, inArray } from "drizzle-orm";
import { AuthenticatedContext } from "@/lib/endpoint-builder";
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  getFeedSchema,
  getPostCommentsSchema,
} from "@/schemas/posts";

export const createPost = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { message: "Invalid request body", errors: parsed.error.issues },
      400
    );
  }

  const postData = parsed.data;

  // If bookId is provided, verify it exists
  if (postData.bookId) {
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, postData.bookId))
      .limit(1);

    if (!book) {
      return c.json({ message: "Book not found" }, 404);
    }
  }

  const [newPost] = await db
    .insert(posts)
    .values({
      ...postData,
      userId: user.id,
    })
    .returning({
      id: posts.id,
      userId: posts.userId,
      content: posts.content,
      postType: posts.postType,
      bookId: posts.bookId,
      quoteText: posts.quoteText,
      pageNumber: posts.pageNumber,
      progressPercentage: posts.progressPercentage,
      rating: posts.rating,
      imageUrl: posts.imageUrl,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      repostsCount: posts.repostsCount,
      isPrivate: posts.isPrivate,
      createdAt: posts.createdAt,
    });

  return c.json({ post: newPost }, 201);
};

export const getFeed = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  const query = c.req.query();
  const parsed = getFeedSchema.safeParse(query);

  if (!parsed.success) {
    return c.json(
      { message: "Invalid query parameters", errors: parsed.error.issues },
      400
    );
  }

  const { limit, offset, type } = parsed.data;

  let feedPosts;

  if (type === "following") {
    // Optimized single query using JOIN to get posts from followed users + own posts
    feedPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        postType: posts.postType,
        bookId: posts.bookId,
        quoteText: posts.quoteText,
        pageNumber: posts.pageNumber,
        progressPercentage: posts.progressPercentage,
        rating: posts.rating,
        imageUrl: posts.imageUrl,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        repostsCount: posts.repostsCount,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          isVerified: users.isVerified,
        },
        book: {
          id: books.id,
          title: books.title,
          authors: books.authors,
          thumbnail: books.thumbnail,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(books, eq(posts.bookId, books.id))
      .leftJoin(follows, eq(follows.followingId, posts.userId))
      .where(
        and(
          or(
            eq(posts.userId, user.id), // Own posts
            eq(follows.followerId, user.id) // Posts from followed users
          ),
          eq(posts.isPrivate, false)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(posts.createdAt));
  } else {
    // Discover feed - all public posts
    feedPosts = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        postType: posts.postType,
        bookId: posts.bookId,
        quoteText: posts.quoteText,
        pageNumber: posts.pageNumber,
        progressPercentage: posts.progressPercentage,
        rating: posts.rating,
        imageUrl: posts.imageUrl,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        repostsCount: posts.repostsCount,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          profileImage: users.profileImage,
          isVerified: users.isVerified,
        },
        book: {
          id: books.id,
          title: books.title,
          authors: books.authors,
          thumbnail: books.thumbnail,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .leftJoin(books, eq(posts.bookId, books.id))
      .where(eq(posts.isPrivate, false))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(posts.createdAt));
  }

  return c.json({
    posts: feedPosts,
    hasMore: feedPosts.length === limit,
  });
};

export const likePost = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  // Check if post exists
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return c.json({ message: "Post not found" }, 404);
  }

  // Check if already liked
  const existing = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ message: "Post already liked" }, 409);
  }

  // Add like
  await db.insert(postLikes).values({
    postId,
    userId: user.id,
  });

  // Update likes count
  await db
    .update(posts)
    .set({
      likesCount: sql`${posts.likesCount} + 1`,
    })
    .where(eq(posts.id, postId));

  return c.json({ message: "Post liked successfully" });
};

export const unlikePost = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  // Check if like exists
  const existing = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ message: "Post not liked" }, 404);
  }

  // Remove like
  await db
    .delete(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)));

  // Update likes count
  await db
    .update(posts)
    .set({
      likesCount: sql`${posts.likesCount} - 1`,
    })
    .where(eq(posts.id, postId));

  return c.json({ message: "Post unliked successfully" });
};

export const addComment = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  const postId = c.req.param("id");
  const body = await c.req.json();
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { message: "Invalid request body", errors: parsed.error.issues },
      400
    );
  }

  const { content, parentCommentId } = parsed.data;

  // Check if post exists
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return c.json({ message: "Post not found" }, 404);
  }

  // If parentCommentId is provided, verify it exists
  if (parentCommentId) {
    const [parentComment] = await db
      .select()
      .from(postComments)
      .where(eq(postComments.id, parentCommentId))
      .limit(1);

    if (!parentComment) {
      return c.json({ message: "Parent comment not found" }, 404);
    }
  }

  const [newComment] = await db
    .insert(postComments)
    .values({
      postId,
      userId: user.id,
      content,
      parentCommentId,
    })
    .returning({
      id: postComments.id,
      postId: postComments.postId,
      userId: postComments.userId,
      content: postComments.content,
      parentCommentId: postComments.parentCommentId,
      likesCount: postComments.likesCount,
      createdAt: postComments.createdAt,
    });

  // Update comments count on post
  await db
    .update(posts)
    .set({
      commentsCount: sql`${posts.commentsCount} + 1`,
    })
    .where(eq(posts.id, postId));

  return c.json({ comment: newComment }, 201);
};

export const getPostComments = async (c: Context) => {
  const postId = c.req.param("id");
  const query = c.req.query();
  const parsed = getPostCommentsSchema.safeParse(query);

  if (!parsed.success) {
    return c.json(
      { message: "Invalid query parameters", errors: parsed.error.issues },
      400
    );
  }

  const { limit, offset } = parsed.data;

  const comments = await db
    .select({
      id: postComments.id,
      postId: postComments.postId,
      userId: postComments.userId,
      content: postComments.content,
      parentCommentId: postComments.parentCommentId,
      likesCount: postComments.likesCount,
      createdAt: postComments.createdAt,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
        profileImage: users.profileImage,
        isVerified: users.isVerified,
      },
    })
    .from(postComments)
    .innerJoin(users, eq(postComments.userId, users.id))
    .where(
      and(
        eq(postComments.postId, postId),
        isNull(postComments.parentCommentId) // Only top-level comments for now
      )
    )
    .limit(limit)
    .offset(offset)
    .orderBy(desc(postComments.createdAt));

  return c.json({
    comments,
    hasMore: comments.length === limit,
  });
};
