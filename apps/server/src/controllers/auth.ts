import { Context } from "hono";
import { prisma } from "@/lib/prisma";
import { sign } from "hono/jwt";
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/schemas/auth";
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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return c.json({ message: "Email already in use" }, 409);
  }

  const passwordHash = await Bun.password.hash(password, {
    algorithm: "argon2id",
  });

  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true },
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

  await prisma.token.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(exp * 1000),
    },
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
  const userRecord = await prisma.user.findUnique({ where: { email } });
  if (!userRecord) {
    return c.json({ message: "Invalid email or password" }, 401);
  }

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

  await prisma.token.create({
    data: {
      token,
      userId: userRecord.id,
      expiresAt: new Date(exp * 1000),
    },
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
    await prisma.token.updateMany({
      where: { token, revokedAt: null },
      data: { revokedAt: new Date() },
    });
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
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    return c.json({ message: "If the email exists, a reset link will be sent" });
  }

  const resetToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.passwordReset.create({
    data: {
      token: resetToken,
      userId: user.id,
      expiresAt,
    },
  });

  await sendEmail({
    to: [email],
    subject: "Restablecer contraseña",
    from: Bun.env.FROM_EMAIL || "noreply@example.com",
    react: ForgotPasswordEmail({ 
      name: user.name || "Usuario",
      resetLink: `${Bun.env.CLIENT_URL}/reset-password?token=${resetToken}`
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
  
  const resetRecord = await prisma.passwordReset.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
    include: { user: true },
  });

  if (!resetRecord) {
    return c.json({ message: "Invalid or expired reset token" }, 400);
  }

  const passwordHash = await Bun.password.hash(password, {
    algorithm: "argon2id",
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return c.json({ message: "Password reset successfully" });
};