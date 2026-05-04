import { type Request, type Response } from "express";
import { type AuthenticatedRequest } from "../middleware/authMiddleware";
import { addRating, fetchRatingsForCandidate } from "../services/ratingService";
import { type CreateRatingInput } from "../validators/ratingSchemas";
import { paginateResponse, parsePagination } from "../utils/pagination";

export const createRating = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const rating = await addRating(req.user.userId, req.body as CreateRatingInput);
    res.status(201).json(rating);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create rating";
    const status =
      message === "Receiver not found"
        ? 404
        : message === "Only candidates can be rated" ||
            message === "You cannot rate yourself" ||
            message === "User is not a candidate"
          ? 400
          : message === "Rating already exists for this category"
            ? 409
            : 500;
    res.status(status).json({ message });
  }
};

export const getCandidateRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = Number(req.params.candidateId);
    if (!Number.isInteger(candidateId) || candidateId <= 0) {
      res.status(400).json({ message: "Invalid candidate id" });
      return;
    }

    const { page, limit, offset } = parsePagination(req.query);
    const { items, total } = await fetchRatingsForCandidate(candidateId, { limit, offset });
    res.status(200).json(paginateResponse({ items, page, limit, total }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load ratings";
    const status = message === "Candidate not found" ? 404 : message === "User is not a candidate" ? 400 : 500;
    res.status(status).json({ message });
  }
};
