import { or } from "@prisma/orm-postgres/orm-client";
import { db } from "./src/prisma/db.ts";

const S = db.orm.public.Submission;

const users = db.orm.public.User
  .where((u) => or(u.name.ilike("%x%"), u.email.ilike("%y%")))
  .select("id");

export const a = S.where((s) => s.ownerId.in(users)).all();
export const b = S.where((s) =>
  or(s.name.ilike("%x%"), s.ownerId.in(users)),
).all();
