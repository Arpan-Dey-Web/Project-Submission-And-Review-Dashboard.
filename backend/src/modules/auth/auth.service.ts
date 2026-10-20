import bcrypt from "bcryptjs";

import { connectDatabase, db } from "../../prisma/db.ts";
import { errors } from "../../lib/errors.ts";
import { signToken } from "../../lib/auth.ts";
import type { LoginInput, SignupInput } from "./auth.validation.ts";

const BCRYPT_ROUNDS = 10;

export async function signupStudent(input: SignupInput) {
  await connectDatabase();

  const existing = await db.orm.public.User.where({ email: input.email }).first();
  if (existing) {
    // Same 409 for "already signed up" — mirror the DB-level unique contract.
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

export async function login(input: LoginInput) {
  await connectDatabase();

  const user = await db.orm.public.User.where({ email: input.email }).first();
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    // AuthN failure: identical response for unknown email + wrong password
    // so error responses never reveal which accounts exist.
    throw errors.unauthorized("Invalid email or password");
  }

  return { token: signToken({ id: user.id, role: user.role }), user: publicUser(user) };
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: unknown;
}

export function publicUser(user: UserRow) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
