import { Context } from "hono";
import { db } from "@/db";
import { users, tokens, passwordResets } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { sign } from "hono/jwt";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/auth";
import { AuthenticatedContext } from "@/lib/endpoint-builder";
import { sendEmail } from "@/lib/utils";
import { ForgotPasswordEmail } from "@/emails/forgot-password";

function getJwtTimestamps(ttlSeconds: number): { iat: number; exp: number } {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return { iat: nowSeconds, exp: nowSeconds + ttlSeconds };
}

export const signup = async (c: Context) => {
  const body = await c.req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { message: "Invalid request body", errors: parsed.error.issues },
      400
    );
  }

  const { email, password, name } = parsed.data;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return c.json({ message: "Email already in use" }, 409);
  }

  const passwordHash = await Bun.password.hash(password, {
    algorithm: "argon2id",
  });

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
    });

  const secret = Bun.env.JWT_SECRET;
  if (!secret) {
    return c.json({ message: "Server configuration error" }, 500);
  }

  const { iat, exp } = getJwtTimestamps(604800);
  const token = await sign(
    { sub: user.id, email: user.email, iat, exp },
    secret
  );

  await db.insert(tokens).values({
    token,
    userId: user.id,
    expiresAt: new Date(exp * 1000),
  });

  return c.json({ user, token }, 201);
};

export const login = async (c: Context) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { message: "Invalid request body", errors: parsed.error.issues },
      400
    );
  }

  const { email, password } = parsed.data;
  const userRecords = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (userRecords.length === 0) {
    return c.json({ message: "Invalid email or password" }, 401);
  }

  const userRecord = userRecords[0];

  const isValid = await Bun.password.verify(password, userRecord.passwordHash);
  if (!isValid) {
    return c.json({ message: "Invalid email or password" }, 401);
  }

  const secret = Bun.env.JWT_SECRET;
  if (!secret) {
    return c.json({ message: "Server configuration error" }, 500);
  }

  const { iat, exp } = getJwtTimestamps(604800);
  const token = await sign(
    { sub: userRecord.id, email: userRecord.email, iat, exp },
    secret
  );

  await db.insert(tokens).values({
    token,
    userId: userRecord.id,
    expiresAt: new Date(exp * 1000),
  });

  return c.json({
    user: { id: userRecord.id, email: userRecord.email, name: userRecord.name },
    token,
  });
};

export const logout = async (c: Context) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.substring(7);

  if (token) {
    await db
      .update(tokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(tokens.token, token), isNull(tokens.revokedAt)));
  }

  return c.json({ message: "Logged out" });
};

export const forgotPassword = async (c: Context) => {
  const body = await c.req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { message: "Invalid request body", errors: parsed.error.issues },
      400
    );
  }

  const { email } = parsed.data;
  const userRecords = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userRecords.length === 0) {
    return c.json({
      message: "If the email exists, a reset link will be sent",
    });
  }

  const user = userRecords[0];

  const resetToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(passwordResets).values({
    token: resetToken,
    userId: user.id,
    expiresAt,
  });

  await sendEmail({
    to: [email],
    subject: "Restablecer contraseña",
    from: Bun.env.FROM_EMAIL || "noreply@example.com",
    react: ForgotPasswordEmail({
      name: user.name || "Usuario",
      resetLink: `${Bun.env.CLIENT_URL}/reset-password?token=${resetToken}`,
    }),
  });

  return c.json({ message: "If the email exists, a reset link will be sent" });
};

export const resetPassword = async (c: Context) => {
  const body = await c.req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { message: "Invalid request body", errors: parsed.error.issues },
      400
    );
  }

  const { token, password } = parsed.data;

  const resetRecords = await db
    .select({
      id: passwordResets.id,
      userId: passwordResets.userId,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
      },
    })
    .from(passwordResets)
    .innerJoin(users, eq(passwordResets.userId, users.id))
    .where(
      and(
        eq(passwordResets.token, token),
        gt(passwordResets.expiresAt, new Date()),
        isNull(passwordResets.usedAt)
      )
    )
    .limit(1);

  if (resetRecords.length === 0) {
    return c.json({ message: "Invalid or expired reset token" }, 400);
  }

  const resetRecord = resetRecords[0];

  const passwordHash = await Bun.password.hash(password, {
    algorithm: "argon2id",
  });

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, resetRecord.userId));

    await tx
      .update(passwordResets)
      .set({ usedAt: new Date() })
      .where(eq(passwordResets.id, resetRecord.id));
  });

  return c.json({ message: "Password reset successfully" });
};
