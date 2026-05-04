import { Router } from "express";
import {
  getCandidateProfile,
  getRecruiterProfile,
  upsertCandidateProfile,
  upsertRecruiterProfile,
} from "../controllers/profileController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validateBody";
import { candidateProfileSchema, recruiterProfileSchema } from "../validators/profileSchemas";

const profileRouter = Router();

profileRouter.get("/recruiter/me", authenticate, authorize("recruiter"), getRecruiterProfile);
profileRouter.put(
  "/recruiter/me",
  authenticate,
  authorize("recruiter"),
  validateBody(recruiterProfileSchema),
  upsertRecruiterProfile
);

profileRouter.get("/candidate/me", authenticate, authorize("candidate"), getCandidateProfile);
profileRouter.put(
  "/candidate/me",
  authenticate,
  authorize("candidate"),
  validateBody(candidateProfileSchema),
  upsertCandidateProfile
);

export default profileRouter;
