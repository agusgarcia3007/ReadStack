import { Context } from "hono";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, ilike, and, ne, or } from "drizzle-orm";
import { AuthenticatedContext } from "@/lib/endpoint-builder";
import { updateProfileSchema, searchUsersSchema } from "@/schemas/users";

export const getProfile = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  
  const [profile] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      bio: users.bio,
      profileImage: users.profileImage,
      location: users.location,
      website: users.website,
      readingGoal: users.readingGoal,
      booksReadCount: users.booksReadCount,
      followersCount: users.followersCount,
      followingCount: users.followingCount,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user.id));

  if (!profile) {
    return c.json({ message: "User not found" }, 404);
  }

  return c.json({ profile });
};

export const updateProfile = async (c: AuthenticatedContext) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = updateProfileSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json(
      { message: "Invalid request body", errors: parsed.error.issues },
      400
    );
  }

  const { username, ...updateData } = parsed.data;

  // Check if username is unique (if provided)
  if (username) {
    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username), ne(users.id, user.id)))
      .limit(1);
    
    if (existing.length > 0) {
      return c.json({ message: "Username already taken" }, 409);
    }
  }

  const [updatedUser] = await db
    .update(users)
    .set({ username, ...updateData })
    .where(eq(users.id, user.id))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      bio: users.bio,
      profileImage: users.profileImage,
      location: users.location,
      website: users.website,
      readingGoal: users.readingGoal,
      booksReadCount: users.booksReadCount,
      followersCount: users.followersCount,
      followingCount: users.followingCount,
      isVerified: users.isVerified,
    });

  return c.json({ profile: updatedUser });
};

export const getUserByUsername = async (c: Context) => {
  const username = c.req.param("username");
  
  const [profile] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      profileImage: users.profileImage,
      location: users.location,
      website: users.website,
      readingGoal: users.readingGoal,
      booksReadCount: users.booksReadCount,
      followersCount: users.followersCount,
      followingCount: users.followingCount,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username));

  if (!profile) {
    return c.json({ message: "User not found" }, 404);
  }

  return c.json({ profile });
};

export const searchUsers = async (c: Context) => {
  const query = c.req.query();
  const parsed = searchUsersSchema.safeParse(query);
  
  if (!parsed.success) {
    return c.json(
      { message: "Invalid query parameters", errors: parsed.error.issues },
      400
    );
  }

  const { query: searchQuery, limit, offset } = parsed.data;

  const results = await db
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
      or(
        ilike(users.username, `%${searchQuery}%`),
        ilike(users.name, `%${searchQuery}%`)
      )
    )
    .limit(limit)
    .offset(offset)
    .orderBy(users.followersCount);

  return c.json({
    users: results,
    hasMore: results.length === limit,
  });
};