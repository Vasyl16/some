import { Router } from "express";
import { createJob, getJobs, getSingleJob, updateJob } from "../controllers/jobController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validateBody";
import { createJobSchema, updateJobSchema } from "../validators/jobSchemas";

const jobRouter = Router();

jobRouter.post("/", authenticate, authorize("recruiter"), validateBody(createJobSchema), createJob);
jobRouter.get("/", getJobs);
jobRouter.get("/:id", getSingleJob);
jobRouter.put("/:id", authenticate, authorize("recruiter"), validateBody(updateJobSchema), updateJob);

export default jobRouter;
