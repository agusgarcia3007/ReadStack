import { createEndpoint, createRouter } from "@/lib/endpoint-builder";
import * as postsController from "@/controllers/posts";

export const postsRouter = createRouter([
  createEndpoint(
    { path: "/", isPrivate: true },
    { POST: postsController.createPost }
  ),
  createEndpoint(
    { path: "/:id/like", isPrivate: true },
    { POST: postsController.likePost, DELETE: postsController.unlikePost }
  ),
  createEndpoint(
    { path: "/:id/comments", isPrivate: false },
    { GET: postsController.getPostComments }
  ),
  createEndpoint(
    { path: "/:id/comments", isPrivate: true },
    { POST: postsController.addComment }
  ),
]);

export const feedRouter = createRouter([
  createEndpoint(
    { path: "/", isPrivate: true },
    { GET: postsController.getFeed }
  ),
]);