import { Context } from "hono";
import { db } from "@/db";
import { users, follows } from "@/db/schema";
import { eq, and, ne, desc, sql } from "drizzle-orm";
import { AuthenticatedContext } from "@/lib/endpoint-builder";
import { 
  followUserSchema, 
  getFollowersSchema, 
  getFollowingSchema, 
  getSuggestionsSchema 
} from "@/schemas/social";

export const followUser = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = followUserSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json(
      { message: "Invalid request body", errors: parsed.error.issues },
      400
    );
  }

  const { userId: targetUserId } = parsed.data;

  // Can't follow yourself
  if (user.id === targetUserId) {
    return c.json({ message: "Cannot follow yourself" }, 400);
  }

  // Check if target user exists
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);

  if (!targetUser) {
    return c.json({ message: "User not found" }, 404);
  }

  // Check if already following
  const existing = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, user.id),
        eq(follows.followingId, targetUserId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return c.json({ message: "Already following this user" }, 409);
  }

  // Create follow relationship
  await db.insert(follows).values({
    followerId: user.id,
    followingId: targetUserId,
  });

  // Update follower/following counts
  await db
    .update(users)
    .set({ 
      followingCount: sql`${users.followingCount} + 1` 
    })
    .where(eq(users.id, user.id));

  await db
    .update(users)
    .set({ 
      followersCount: sql`${users.followersCount} + 1` 
    })
    .where(eq(users.id, targetUserId));

  return c.json({ message: "Successfully followed user" });
};

export const unfollowUser = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  const targetUserId = c.req.param("userId");

  // Check if follow relationship exists
  const existing = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, user.id),
        eq(follows.followingId, targetUserId)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return c.json({ message: "Not following this user" }, 404);
  }

  // Delete follow relationship
  await db
    .delete(follows)
    .where(
      and(
        eq(follows.followerId, user.id),
        eq(follows.followingId, targetUserId)
      )
    );

  // Update follower/following counts
  await db
    .update(users)
    .set({ 
      followingCount: sql`${users.followingCount} - 1` 
    })
    .where(eq(users.id, user.id));

  await db
    .update(users)
    .set({ 
      followersCount: sql`${users.followersCount} - 1` 
    })
    .where(eq(users.id, targetUserId));

  return c.json({ message: "Successfully unfollowed user" });
};

export const getFollowers = async (c: Context) => {
  const userId = c.req.param("userId");
  const query = c.req.query();
  const parsed = getFollowersSchema.safeParse(query);
  
  if (!parsed.success) {
    return c.json(
      { message: "Invalid query parameters", errors: parsed.error.issues },
      400
    );
  }

  const { limit, offset } = parsed.data;

  const followers = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
      followersCount: users.followersCount,
      followingCount: users.followingCount,
      isVerified: users.isVerified,
      createdAt: follows.createdAt,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followerId, users.id))
    .where(eq(follows.followingId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(follows.createdAt));

  return c.json({
    followers,
    hasMore: followers.length === limit,
  });
};

export const getFollowing = async (c: Context) => {
  const userId = c.req.param("userId");
  const query = c.req.query();
  const parsed = getFollowingSchema.safeParse(query);
  
  if (!parsed.success) {
    return c.json(
      { message: "Invalid query parameters", errors: parsed.error.issues },
      400
    );
  }

  const { limit, offset } = parsed.data;

  const following = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      profileImage: users.profileImage,
      followersCount: users.followersCount,
      followingCount: users.followingCount,
      isVerified: users.isVerified,
      createdAt: follows.createdAt,
    })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.id))
    .where(eq(follows.followerId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(follows.createdAt));

  return c.json({
    following,
    hasMore: following.length === limit,
  });
};

export const getSuggestions = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  const query = c.req.query();
  const parsed = getSuggestionsSchema.safeParse(query);
  
  if (!parsed.success) {
    return c.json(
      { message: "Invalid query parameters", errors: parsed.error.issues },
      400
    );
  }

  const { limit } = parsed.data;

  // Get suggested users (users not followed by current user, ordered by followers count)
  const suggestions = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      profileImage: users.profileImage,
      followersCount: users.followersCount,
      followingCount: users.followingCount,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(
      and(
        ne(users.id, user.id),
        // Not already following - this is a complex subquery, simplified for now
        sql`${users.id} NOT IN (
          SELECT ${follows.followingId} 
          FROM ${follows} 
          WHERE ${follows.followerId} = ${user.id}
        )`
      )
    )
    .limit(limit)
    .orderBy(desc(users.followersCount));

  return c.json({ suggestions });
};