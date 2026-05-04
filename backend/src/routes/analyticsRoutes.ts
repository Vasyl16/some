import { Router } from "express";
import { getBestCandidates } from "../controllers/analyticsController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validateBody";
import { bestCandidatesSchema } from "../validators/analyticsSchemas";

const analyticsRouter = Router();

analyticsRouter.post(
  "/jobs/:jobId/best-candidates",
  authenticate,
  authorize("recruiter"),
  validateBody(bestCandidatesSchema),
  getBestCandidates
);

export default analyticsRouter;
