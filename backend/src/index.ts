import { application } from "./app.ts";
import { connectDatabase } from "./prisma/db.ts";
import { runSeed } from "./prisma/seed.ts";
import { env } from "./config/env.ts";

async function bootstrap() {
  await connectDatabase();
  await runSeed();

  application().listen(env.port, () => {
    console.log(`API ready on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
