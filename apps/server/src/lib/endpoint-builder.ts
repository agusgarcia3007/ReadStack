import { Hono, Context, MiddlewareHandler, Handler } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import { db } from "@/db";
import { tokens, users } from "@/db/schema";
import { eq } from "drizzle-orm";

type Variables = JwtVariables & {
  user: {
    id: string;
    email: string;
  };
};

export interface AuthenticatedContext
  extends Context<{ Variables: Variables }> {}

export interface EndpointConfig {
  path: string;
  isPrivate: boolean;
  middlewares?: MiddlewareHandler[];
}

export interface RouteConfig {
  GET?: Handler;
  POST?: Handler;
  PUT?: Handler;
  DELETE?: Handler;
  PATCH?: Handler;
}

const jwtMiddleware: MiddlewareHandler = async (c, next) => {
  const secret = Bun.env.JWT_SECRET;
  if (!secret) {
    return c.json({ message: "Server configuration error" }, 500);
  }

  const jwtAuth = jwt({ secret });
  return await jwtAuth(c, next);
};

const userMiddleware: MiddlewareHandler = async (c, next) => {
  const payload = c.get("jwtPayload");

  if (!payload || !payload.sub) {
    return c.json({ message: "Invalid token payload" }, 401);
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ message: "Token required" }, 401);
  }

  const token = authHeader.substring(7);

  const tokenRecords = await db
    .select({
      id: tokens.id,
      revokedAt: tokens.revokedAt,
      expiresAt: tokens.expiresAt,
      user: {
        id: users.id,
        email: users.email,
      },
    })
    .from(tokens)
    .innerJoin(users, eq(tokens.userId, users.id))
    .where(eq(tokens.token, token))
    .limit(1);

  if (tokenRecords.length === 0) {
    return c.json({ message: "Invalid or expired token" }, 401);
  }

  const tokenRecord = tokenRecords[0];

  if (tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
    return c.json({ message: "Invalid or expired token" }, 401);
  }

  c.set("user", {
    id: tokenRecord.user.id,
    email: tokenRecord.user.email,
  });

  await next();
};

export function createEndpoint(
  config: EndpointConfig,
  routes: RouteConfig
): Hono<{ Variables: Variables }> {
  const app = new Hono<{ Variables: Variables }>();

  const middlewares = config.middlewares || [];
  if (config.isPrivate) {
    middlewares.unshift(jwtMiddleware, userMiddleware);
  }

  if (routes.GET) {
    app.get(config.path, ...middlewares, routes.GET as Handler);
  }
  if (routes.POST) {
    app.post(config.path, ...middlewares, routes.POST as Handler);
  }
  if (routes.PUT) {
    app.put(config.path, ...middlewares, routes.PUT as Handler);
  }
  if (routes.DELETE) {
    app.delete(config.path, ...middlewares, routes.DELETE as Handler);
  }
  if (routes.PATCH) {
    app.patch(config.path, ...middlewares, routes.PATCH as Handler);
  }

  return app;
}

export function createRouter(
  endpoints: Hono<{ Variables: Variables }>[]
): Hono<{ Variables: Variables }> {
  const router = new Hono<{ Variables: Variables }>();
  endpoints.forEach((endpoint) => {
    router.route("/", endpoint);
  });
  return router;
}
