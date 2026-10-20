import bcrypt from "bcryptjs";

import { connectDatabase, db } from "../../prisma/db.ts";
import { errors } from "../../lib/errors.ts";
import { signToken } from "../../lib/auth.ts";
import type { AuthResponse, LoginInput, PublicUser, SignupInput } from "../../types/index.ts";

const BCRYPT_ROUNDS = 10;

export async function signupStudent(input: SignupInput): Promise<AuthResponse> {
  await connectDatabase();

  const existing = await db.orm.public.User.where({ email: input.email }).first();
  if (existing) {
    throw errors.conflict("This email is already taken. Try signing up with another.");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await db.orm.public.User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: "STUDENT",
  });

  return { token: signToken({ id: user.id, role: "STUDENT" }), user: publicUser(user) };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  await connectDatabase();

  const user = await db.orm.public.User.where({ email: input.email }).first();
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw errors.unauthorized("Invalid email or password");
  }

  return { token: signToken({ id: user.id, role: user.role }), user: publicUser(user) };
}

export function publicUser(user: {
  id: number;
  name: string;
  email: string;
  role: string;
}): PublicUser {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
