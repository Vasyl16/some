import { Router } from "express";
import { login, register } from "../controllers/authController";
import {
  authenticate,
  authorize,
  type AuthenticatedRequest,
} from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validateBody";
import { loginSchema, registerSchema } from "../validators/authSchemas";

const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);

authRouter.get("/me", authenticate, (req: AuthenticatedRequest, res) => {
  res.status(200).json({ user: req.user });
});

authRouter.get("/candidate-only", authenticate, authorize("candidate"), (_req, res) => {
  res.status(200).json({ message: "Candidate access granted" });
});

authRouter.get("/recruiter-only", authenticate, authorize("recruiter"), (_req, res) => {
  res.status(200).json({ message: "Recruiter access granted" });
});

export default authRouter;
