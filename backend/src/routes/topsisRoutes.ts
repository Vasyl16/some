import { Router } from "express";
import { rankCandidates } from "../controllers/topsisController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validateBody";
import { topsisWeightsSchema } from "../validators/topsisSchemas";

const topsisRouter = Router();

topsisRouter.post(
  "/jobs/:jobId/rank",
  authenticate,
  authorize("recruiter"),
  validateBody(topsisWeightsSchema),
  rankCandidates
);

export default topsisRouter;
