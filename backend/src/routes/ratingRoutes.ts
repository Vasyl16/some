import { Router } from "express";
import { createRating, getCandidateRatings } from "../controllers/ratingController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validateBody } from "../middleware/validateBody";
import { createRatingSchema } from "../validators/ratingSchemas";

const ratingRouter = Router();

ratingRouter.post("/", authenticate, authorize("recruiter"), validateBody(createRatingSchema), createRating);
ratingRouter.get("/candidate/:candidateId", getCandidateRatings);

export default ratingRouter;
