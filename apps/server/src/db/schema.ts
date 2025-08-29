import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  integer,
  json,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  // Enhanced profile fields
  username: varchar("username", { length: 50 }).unique(),
  bio: text("bio"),
  profileImage: text("profile_image"), // MinIO URL
  location: text("location"),
  website: text("website"),
  readingGoal: integer("reading_goal").default(0),
  booksReadCount: integer("books_read_count").default(0),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const tokens = pgTable("tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResets = pgTable("password_resets", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  googleBooksId: text("google_books_id"), // NULL for manually added books
  title: text("title").notNull(),
  authors: json("authors").$type<string[]>().default([]).notNull(),
  publisher: text("publisher"),
  publishedDate: text("published_date"),
  description: text("description"),
  isbn10: text("isbn10"),
  isbn13: text("isbn13"),
  thumbnail: text("thumbnail"),
  coverImage: text("cover_image"), // MinIO uploaded image URL
  categories: json("categories").$type<string[]>().default([]).notNull(),
  pageCount: integer("page_count"),
  language: text("language").default("unknown").notNull(),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }), // User who added this book
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// User reading status
export const userBooks = pgTable(
  "user_books",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["want_to_read", "currently_reading", "completed", "dnf"],
    }).notNull(),
    rating: integer("rating"), // 1-5 stars
    progressPages: integer("progress_pages").default(0),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    privateNotes: text("private_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userBookUnique: unique().on(table.userId, table.bookId),
  })
);

// Social following system
export const follows = pgTable(
  "follows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    followUnique: unique().on(table.followerId, table.followingId),
  })
);

// Posts for social feed
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  postType: text("post_type", {
    enum: ["quote", "progress", "review", "thought", "recommendation"],
  }).notNull(),

  // Book-related fields
  bookId: uuid("book_id").references(() => books.id, { onDelete: "set null" }),
  quoteText: text("quote_text"),
  pageNumber: integer("page_number"),
  progressPercentage: integer("progress_percentage"),
  rating: integer("rating"), // 1-5 stars

  // Media
  imageUrl: text("image_url"), // MinIO uploaded images

  // Social stats
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  repostsCount: integer("reposts_count").default(0),

  // Privacy
  isPrivate: boolean("is_private").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Post likes
export const postLikes = pgTable(
  "post_likes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    postLikeUnique: unique().on(table.postId, table.userId),
  })
);

// Post comments - defined without self-reference first
export const postComments = pgTable("post_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentCommentId: uuid("parent_comment_id"),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reposts
export const reposts = pgTable(
  "reposts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    originalPostId: uuid("original_post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    comment: text("comment"), // Optional comment on repost
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    repostUnique: unique().on(table.originalPostId, table.userId),
  })
);

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: ["follow", "like", "comment", "mention"],
  }).notNull(),
  fromUserId: uuid("from_user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tokens: many(tokens),
  passwordResets: many(passwordResets),
  booksCreated: many(books),
  userBooks: many(userBooks),
  posts: many(posts),
  postLikes: many(postLikes),
  postComments: many(postComments),
  reposts: many(reposts),
  notifications: many(notifications),
  notificationsFrom: many(notifications, { relationName: "notificationFrom" }),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
}));

export const tokensRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}));

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [books.createdBy],
    references: [users.id],
  }),
  userBooks: many(userBooks),
  posts: many(posts),
}));

export const userBooksRelations = relations(userBooks, ({ one }) => ({
  user: one(users, {
    fields: [userBooks.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [userBooks.bookId],
    references: [books.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [posts.bookId],
    references: [books.id],
  }),
  likes: many(postLikes),
  comments: many(postComments),
  reposts: many(reposts),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const postCommentsRelations = relations(
  postComments,
  ({ one, many }) => ({
    post: one(posts, {
      fields: [postComments.postId],
      references: [posts.id],
    }),
    user: one(users, {
      fields: [postComments.userId],
      references: [users.id],
    }),
    parentComment: one(postComments, {
      fields: [postComments.parentCommentId],
      references: [postComments.id],
      relationName: "parent",
    }),
    replies: many(postComments, { relationName: "parent" }),
  })
);

export const repostsRelations = relations(reposts, ({ one }) => ({
  originalPost: one(posts, {
    fields: [reposts.originalPostId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [reposts.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  fromUser: one(users, {
    fields: [notifications.fromUserId],
    references: [users.id],
    relationName: "notificationFrom",
  }),
  post: one(posts, {
    fields: [notifications.postId],
    references: [posts.id],
  }),
}));
