import { Router } from "express";

import { env } from "../../config/env.ts";
import { validateBody } from "../../lib/validate.ts";
import { rateLimit } from "../../middleware/rate-limit.ts";
import { loginController, signupController } from "./auth.controller.ts";
import { loginSchema, signupSchema } from "./auth.validation.ts";

export const authRouter = Router();

const authRateLimit = () =>
  rateLimit({
    ...env.authRateLimit,
    message: "Too many login/signup attempts from this IP. Try again in a few minutes.",
  });

// Express 5 forwards async-controller rejections to the error handler,
// so no `.then().catch()` wiring is needed here.
authRouter.post("/signup", authRateLimit(), validateBody(signupSchema), signupController);

authRouter.post("/login", authRateLimit(), validateBody(loginSchema), loginController);
