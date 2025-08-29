import { Hono, Context, MiddlewareHandler, Handler } from "hono";
import { verify } from "hono/jwt";
import { db } from "@/db";
import { tokens, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedContext extends Context {
  user: {
    id: string;
    email: string;
  };
}

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

const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ message: "Token required" }, 401);
  }

  const token = authHeader.substring(7);
  const secret = Bun.env.JWT_SECRET;
  
  if (!secret) {
    return c.json({ message: "Server configuration error" }, 500);
  }

  try {
    await verify(token, secret);
    
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

    (c as AuthenticatedContext).user = {
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
    };

    await next();
  } catch (error) {
    return c.json({ message: "Invalid token" }, 401);
  }
};

export function createEndpoint(
  config: EndpointConfig,
  routes: RouteConfig
): Hono {
  const app = new Hono();

  const middlewares = config.middlewares || [];
  if (config.isPrivate) {
    middlewares.unshift(authMiddleware);
  }

  if (routes.GET) {
    app.get(config.path, ...middlewares, routes.GET);
  }
  if (routes.POST) {
    app.post(config.path, ...middlewares, routes.POST);
  }
  if (routes.PUT) {
    app.put(config.path, ...middlewares, routes.PUT);
  }
  if (routes.DELETE) {
    app.delete(config.path, ...middlewares, routes.DELETE);
  }
  if (routes.PATCH) {
    app.patch(config.path, ...middlewares, routes.PATCH);
  }

  return app;
}

export function createRouter(endpoints: Hono[]): Hono {
  const router = new Hono();
  endpoints.forEach(endpoint => {
    router.route("/", endpoint);
  });
  return router;
}