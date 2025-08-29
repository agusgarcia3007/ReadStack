import { createEndpoint, createRouter } from "@/lib/endpoint-builder";
import * as socialController from "@/controllers/social";

export const socialRouter = createRouter([
  createEndpoint(
    { path: "/follow", isPrivate: true },
    { POST: socialController.followUser }
  ),
  createEndpoint(
    { path: "/follow/:userId", isPrivate: true },
    { DELETE: socialController.unfollowUser }
  ),
  createEndpoint(
    { path: "/followers/:userId", isPrivate: false },
    { GET: socialController.getFollowers }
  ),
  createEndpoint(
    { path: "/following/:userId", isPrivate: false },
    { GET: socialController.getFollowing }
  ),
  createEndpoint(
    { path: "/suggestions", isPrivate: true },
    { GET: socialController.getSuggestions }
  ),
]);