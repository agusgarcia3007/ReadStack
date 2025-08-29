import { authRouter } from "./auth";
import { booksRouter } from "./books";
import { usersRouter } from "./users";
import { socialRouter } from "./social";
import { postsRouter, feedRouter } from "./posts";

export const Routes = [
  {
    path: "/auth",
    router: authRouter,
  },
  {
    path: "/books",
    router: booksRouter,
  },
  {
    path: "/users",
    router: usersRouter,
  },
  {
    path: "/social",
    router: socialRouter,
  },
  {
    path: "/posts",
    router: postsRouter,
  },
  {
    path: "/feed",
    router: feedRouter,
  },
];
