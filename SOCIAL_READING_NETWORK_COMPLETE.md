# ReadStack - Complete Social Reading Network Implementation

## Project Overview

Build a comprehensive social reading platform where book lovers share quotes, thoughts, and reading progress in a Twitter-like feed format. Users can follow each other, interact with posts, and discover new books through community engagement.

## Important Development Notes 📝

### Database & Schema

- **Database Schema Changes**: All schema modifications should be made in `src/db/schema.ts` using Drizzle ORM syntax
- **Migration Process**: After updating schema, run `bun run db:generate` then `bun run db:migrate` to apply changes

### Frontend Patterns

- **File Naming**: Use kebab-case for all component and file names (e.g., `post-composer.tsx`, `user-card.tsx`)
- **Component Organization**: Group components by feature in dedicated folders (feed, profile, social, books)
- **Forms**: Use the existing form component `@apps/client/src/components/ui/form.tsx` for all forms
- **Loading States**: Use skeleton components for all loading states - no spinners or basic loading text
- **Code Quality**: No linter errors allowed - ensure clean, properly typed code

### API & Services

- **HTTP Requests**: Use the existing service pattern in `@apps/client/src/services/` with separate files:
  - `service.ts` - API service class with static methods
  - `mutations.ts` - TanStack Query mutations and queries, we have a function to handle onError
  - Follow the pattern established in `services/auth/`
- **Dependencies**: Install with `bun add` when needed

### Feed Strategy - Infinite Scroll with Prefetching

- **Query Structure**: Create `feed/query.ts` with TanStack Query infinite query options
- **Pagination**: Serve 20 posts initially, prefetch next page in background
- **UX Goal**: When user scrolls to bottom, next page should already be loaded
- **Implementation**: Use `useInfiniteQuery` with automatic prefetching

### Development Workflow

- **Project Status**: Already running, no need to build - developer handles builds
- **Focus**: Implementation only, no project setup or build configuration

## Current Foundation ✅

### Backend Infrastructure

- **Framework**: Bun + Hono with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Complete JWT-based system with password reset
- **File Storage**: MinIO integration for image uploads
- **Book Integration**: Google Books API with fallback to manual entry

### Existing Database Schema

- **Users**: Basic auth + profile fields
- **Books**: Complete book metadata with Google Books integration
- **Tokens/Auth**: Session management and password resets

### API Endpoints Ready

- **Authentication**: `/auth/signup`, `/auth/login`, `/auth/logout`
- **Books**: Search, create custom books, add from Google Books API
- **File Upload**: MinIO integration for book cover images

## Features to Implement

### 1. Enhanced User Profiles 👤

#### Database Schema Extensions

**Note: All database schema changes should be made in `src/db/schema.ts` using Drizzle ORM syntax. After updating the schema, run `bun run db:generate` and `bun run db:migrate` to apply changes.**

```typescript
// Add to users table in schema.ts
export const users = pgTable("users", {
  // ... existing fields
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
    rating: integer("rating"), // Add check constraint in migration if needed
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
```

#### Profile Features

- **Profile Picture Upload**: MinIO integration for avatar images
- **Username System**: Unique usernames with validation
- **Bio & Reading Goals**: Personal description and annual reading targets
- **Reading Stats**: Books read, current reading streak, favorite genres
- **Privacy Settings**: Public/private profile options

### 2. Social Following System 👥

#### Database Schema

**Note: Add these tables to `src/db/schema.ts` using Drizzle ORM syntax:**

```typescript
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
    // Add check constraint in migration: CHECK(follower_id != following_id)
  })
);

// Notification system
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
```

#### Social Features

- **Follow/Unfollow**: Build reading community connections
- **Follower Recommendations**: Suggest users based on reading preferences
- **Reading Circles**: Private groups for book clubs or friends
- **User Discovery**: Find readers by favorite authors, genres, or books

### 3. Social Feed System 📱

#### Database Schema

**Note: Add these tables to `src/db/schema.ts` using Drizzle ORM syntax:**

```typescript
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
  rating: integer("rating"), // Add check constraint in migration: BETWEEN 1 AND 5

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

export const postComments = pgTable("post_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentCommentId: uuid("parent_comment_id").references(() => postComments.id, {
    onDelete: "cascade",
  }),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
```

#### Feed Features

- **Twitter-like Timeline**: Chronological feed from followed users
- **Post Types**:
  - **Book Quotes**: Share favorite passages with page numbers
  - **Reading Progress**: "Just finished chapter 5 of..."
  - **Book Reviews**: Ratings and detailed thoughts
  - **Reading Thoughts**: General observations and connections
  - **Recommendations**: "You should read this because..."
- **Interactions**: Like, comment, repost with optional commentary
- **Rich Media**: Upload photos of book covers, reading setups, handwritten notes

### 4. Advanced Post Creation 📝

#### Post Composer Features

- **Book Selection Widget**:
  - Choose from "Currently Reading" books
  - Search and add new books on-the-fly
  - Quick access to recently finished books
- **Quote Capture**:
  - Rich text editor for formatting quotes
  - Automatic quote attribution with book details
  - Optional page number field
- **Reading Progress Posts**:
  - Progress slider (0-100%)
  - Reading session tracking
  - Milestone celebrations (25%, 50%, 75%, finished)
- **Media Upload**:
  - Book photos, reading spots, handwritten notes
  - MinIO integration for efficient storage
- **Privacy Controls**: Public, followers-only, or private posts

### 5. Discovery & Recommendations 🔍

#### Smart Discovery Features

- **Trending Books**: Based on community activity and posts
- **Similar Readers**: Find users with overlapping reading history
- **Book Recommendations**:
  - "Because you liked..." suggestions
  - Trending in your genres
  - Friend recommendations
- **Reading Challenges**:
  - Annual reading goals
  - Genre exploration challenges
  - Community reading events
- **Hashtag System**:
  - #CurrentlyReading, #BookClub, #SciFi, etc.
  - Trending topics and discussions

### 6. Mobile-Optimized Experience 📱

#### Frontend Implementation

- **React + TanStack Router**: Already configured
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Progressive Web App**:
  - Offline reading progress sync
  - Push notifications for social interactions
  - App-like experience on mobile devices
- **Infinite Scroll Feed**: Optimized performance for large datasets
- **Quick Actions**:
  - Swipe gestures for like/save
  - Quick post creation with keyboard shortcuts
  - Voice-to-text for quote capture

### 7. Real-time Features ⚡

#### WebSocket Integration

- **Live Feed Updates**: New posts appear without refresh
- **Real-time Notifications**: Instant likes, comments, follows
- **Reading Status**: See when friends are actively reading
- **Typing Indicators**: For comments and direct messages

## Implementation Roadmap

### Phase 1: Core Social Features (Week 1-2)

1. **User Profile Enhancement**:
   - Username system and profile editing
   - Profile picture upload via MinIO
   - Bio and reading goals setup

2. **Basic Social System**:
   - Follow/unfollow functionality
   - User search and discovery
   - Follower/following lists

### Phase 2: Feed & Posts (Week 2-3)

1. **Post Creation System**:
   - Multi-type post composer (quotes, progress, thoughts)
   - Book selection integration
   - Image upload for posts

2. **Social Feed**:
   - Timeline algorithm (chronological + engagement)
   - Post interactions (like, comment, repost)
   - Feed optimization for performance

### Phase 3: Advanced Features (Week 3-4)

1. **Reading Progress Tracking**:
   - User-book relationship management
   - Reading session logging
   - Progress visualization

2. **Enhanced Discovery**:
   - Recommendation engine
   - Trending books and posts
   - Smart user suggestions

### Phase 4: Polish & Optimization (Week 4-5)

1. **Real-time Features**:
   - WebSocket implementation
   - Live notifications system
   - Performance optimization

2. **Mobile Experience**:
   - PWA implementation
   - Advanced mobile interactions
   - Offline functionality

## Technical Architecture

### Backend Structure

```
src/
├── controllers/
│   ├── auth.ts ✅
│   ├── books.ts ✅
│   ├── users.ts (new)
│   ├── posts.ts (new)
│   ├── social.ts (new)
│   └── feed.ts (new)
├── routes/
│   ├── auth.ts ✅
│   ├── books.ts ✅
│   ├── users.ts (new)
│   ├── posts.ts (new)
│   └── social.ts (new)
├── lib/
│   ├── minio.ts ✅
│   ├── google-books.ts ✅
│   ├── feed-algorithm.ts (new)
│   ├── notifications.ts (new)
│   └── websocket.ts (new)
└── schemas/
    ├── auth.ts ✅
    ├── books.ts ✅
    ├── users.ts (new)
    ├── posts.ts (new)
    └── social.ts (new)
```

### Frontend Structure

**Note: Use kebab-case for all component and file names as per project conventions:**

```
src/
├── components/
│   ├── feed/
│   │   ├── post-composer.tsx
│   │   ├── post-card.tsx
│   │   ├── feed-timeline.tsx
│   │   ├── post-interactions.tsx
│   │   └── post-skeleton.tsx (loading state)
│   ├── profile/
│   │   ├── profile-editor.tsx
│   │   ├── profile-stats.tsx
│   │   ├── reading-progress.tsx
│   │   └── profile-skeleton.tsx (loading state)
│   ├── books/
│   │   ├── book-selector.tsx
│   │   ├── book-card.tsx
│   │   ├── reading-status.tsx
│   │   └── book-skeleton.tsx (loading state)
│   └── social/
│       ├── user-card.tsx
│       ├── follow-button.tsx
│       ├── user-search.tsx
│       └── user-skeleton.tsx (loading state)
├── services/
│   ├── auth/ ✅ (existing)
│   ├── feed/
│   │   ├── service.ts
│   │   ├── mutations.ts
│   │   └── query.ts (infinite scroll queries)
│   ├── posts/
│   │   ├── service.ts
│   │   └── mutations.ts
│   ├── users/
│   │   ├── service.ts
│   │   └── mutations.ts
│   └── social/
│       ├── service.ts
│       └── mutations.ts
├── routes/
│   ├── _app/
│   │   ├── feed.tsx (new)
│   │   ├── profile.tsx (new)
│   │   ├── discover.tsx (new)
│   │   └── notifications.tsx (new)
│   └── users/
│       └── $username.tsx (new)
└── types/
    ├── feed.ts (new)
    ├── posts.ts (new)
    ├── users.ts (new)
    └── social.ts (new)
```

### Feed Service Pattern Example

Following the established `services/auth/` pattern:

**`services/feed/service.ts`**:

```typescript
import { http } from "@/lib/http";
import type { FeedResponse, FeedParams } from "@/types/feed";

export class FeedService {
  public static async getFeed(params: FeedParams): Promise<FeedResponse> {
    const { data } = await http.get("/feed", { params });
    return data;
  }
}
```

**`services/feed/query.ts`**:

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { FeedService } from "./service";

export const feedQueryOptions = {
  queryKey: ["feed"],
  queryFn: ({ pageParam = 0 }) =>
    FeedService.getFeed({
      offset: pageParam * 20,
      limit: 20,
    }),
  getNextPageParam: (lastPage, pages) =>
    lastPage.hasMore ? pages.length : undefined,
  initialPageParam: 0,
  //gcTime and staleTiem are already configuyred
};

export const useFeedInfinite = () => {
  return useInfiniteQuery(feedQueryOptions);
};
```

## API Endpoints to Implement

### User Management

- `GET/PUT /users/profile` - Get/update user profile
- `POST /users/profile/avatar` - Upload profile picture
- `GET /users/:username` - Get public profile
- `GET /users/search` - Search users

### Social System

- `POST/DELETE /social/follow/:userId` - Follow/unfollow user
- `GET /social/followers/:userId` - Get followers list
- `GET /social/following/:userId` - Get following list
- `GET /social/suggestions` - Get follow suggestions

### Posts & Feed

- `GET /feed` - Get personalized feed
- `POST /posts` - Create new post
- `GET/PUT/DELETE /posts/:id` - Manage posts
- `POST/DELETE /posts/:id/like` - Like/unlike post
- `GET /posts/:id/comments` - Get post comments
- `POST /posts/:id/comments` - Add comment
- `POST /posts/:id/repost` - Repost with comment

### Reading Progress

- `GET/PUT /reading/books` - Manage user's reading list
- `POST /reading/progress` - Update reading progress
- `GET /reading/stats` - Get reading statistics

This comprehensive social reading network will create an engaging platform where literature enthusiasts can connect, share their passion for books, and discover new reads through meaningful community interactions. The Twitter-like feed format makes it familiar and intuitive while the book-centric features make it uniquely valuable for readers.
