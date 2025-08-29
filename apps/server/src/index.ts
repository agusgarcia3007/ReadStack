import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import type { JwtVariables } from "hono/jwt";
import { authRouter } from "@/routes/auth";
import { Routes } from "./routes";
import { initializeBucket } from "@/lib/minio";

type Variables = JwtVariables & {
  user: {
    id: string;
    email: string;
  };
};

const app = new Hono<{ Variables: Variables }>()
  .use(logger())
  .use(prettyJSON())
  .use(cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

Routes.forEach((route) => {
  app.route(route.path, route.router);
});

// Initialize MinIO bucket on startup
initializeBucket();

export default {
  port: Bun.env.PORT || 4444,
  fetch: app.fetch,
};
