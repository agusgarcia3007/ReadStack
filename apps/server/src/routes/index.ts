import { authRouter } from "./auth";
import { booksRouter } from "./books";

export const Routes = [
  {
    path: "/auth",
    router: authRouter,
  },
  {
    path: "/books",
    router: booksRouter,
  },
];
