import { createEndpoint, createRouter } from "@/lib/endpoint-builder";
import * as usersController from "@/controllers/users";

export const usersRouter = createRouter([
  createEndpoint(
    { path: "/profile", isPrivate: true },
    { GET: usersController.getProfile, PUT: usersController.updateProfile }
  ),
  createEndpoint(
    { path: "/search", isPrivate: false },
    { GET: usersController.searchUsers }
  ),
  createEndpoint(
    { path: "/:username", isPrivate: false },
    { GET: usersController.getUserByUsername }
  ),
]);