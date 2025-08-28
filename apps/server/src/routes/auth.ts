import { createEndpoint, createRouter } from "@/lib/endpoint-builder";
import * as authController from "@/controllers/auth";

export const authRouter = createRouter([
  createEndpoint(
    { path: "/signup", isPrivate: false },
    { POST: authController.signup }
  ),
  createEndpoint(
    { path: "/login", isPrivate: false },
    { POST: authController.login }
  ),
  createEndpoint(
    { path: "/logout", isPrivate: true },
    { POST: authController.logout }
  ),
  createEndpoint(
    { path: "/forgot-password", isPrivate: false },
    { POST: authController.forgotPassword }
  ),
  createEndpoint(
    { path: "/reset-password", isPrivate: false },
    { POST: authController.resetPassword }
  ),
]);
