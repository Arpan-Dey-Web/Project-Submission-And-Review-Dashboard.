import bcrypt from "bcryptjs";

import { connectDatabase, db } from "./db.ts";

const BCRYPT_ROUNDS = 10;

export async function runSeed(): Promise<void> {
  await connectDatabase();

  const passwordHash = await bcrypt.hash("password123", BCRYPT_ROUNDS);

  const mentor = await db.orm.public.User.upsert({
    create: {
      email: "mentor@demo.io",
      name: "Deepa Mentor",
      passwordHash,
      role: "MENTOR",
    },
    update: {},
    conflictOn: { email: "mentor@demo.io" },
  });

  const students = await Promise.all(
    [
      { email: "tisha@demo.io", name: "Tisha Student" },
      { email: "rifat@demo.io", name: "Rifat Student" },
    ].map((student) =>
      db.orm.public.User.upsert({
        create: { ...student, passwordHash, role: "STUDENT" },
        update: {},
        conflictOn: { email: student.email },
      }),
    ),
  );

  const tisha = students[0]!;

  await db.orm.public.Submission.upsert({
    create: {
      ownerId: tisha.id,
      name: "Task Manager App",
      repoUrl: "https://github.com/tisha/task-manager",
      liveUrl: "https://task-manager.tisha.dev",
      description:
        "A task manager with drag-and-drop boards, due dates and per-user filtering built with React and Vite.",
      status: "PENDING",
    },
    update: {},
    conflictOn: { ownerId: tisha.id, repoUrl: "https://github.com/tisha/task-manager" },
  });

  console.log(`Seeded 1 mentor (${mentor.email}) + ${students.length} students.`);
}
