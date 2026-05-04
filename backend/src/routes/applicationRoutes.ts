import { Router } from "express";
import {
  createApplication,
  getApplicationsByJob,
  getMyApplicationsList,
  getMyApplicationByJob,
  updateApplication,
} from "../controllers/applicationController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validateBody";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from "../validators/applicationSchemas";

const applicationRouter = Router();

applicationRouter.post("/", authenticate, authorize("candidate"), validateBody(createApplicationSchema), createApplication);
applicationRouter.get("/me", authenticate, authorize("candidate"), getMyApplicationsList);
applicationRouter.get(
  "/me/job/:jobId",
  authenticate,
  authorize("candidate"),
  getMyApplicationByJob
);
applicationRouter.get(
  "/job/:jobId",
  authenticate,
  authorize("recruiter"),
  getApplicationsByJob
);
applicationRouter.patch(
  "/:id/status",
  authenticate,
  authorize("recruiter"),
  validateBody(updateApplicationStatusSchema),
  updateApplication
);

export default applicationRouter;
