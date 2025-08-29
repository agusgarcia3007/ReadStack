import { pgTable, text, timestamp, varchar, uuid, integer, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
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
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }), // User who added this book
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  tokens: many(tokens),
  passwordResets: many(passwordResets),
  booksCreated: many(books),
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

export const booksRelations = relations(books, ({ one }) => ({
  createdByUser: one(users, {
    fields: [books.createdBy],
    references: [users.id],
  }),
}));
