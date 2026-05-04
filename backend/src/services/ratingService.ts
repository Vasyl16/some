import {
  createRating,
  getRatingBySenderReceiverCategory,
  getRatingsByReceiverPaginated,
  getUserById,
} from "../models/ratingModel";
import { type CreateRatingInput } from "../validators/ratingSchemas";

export const addRating = async (senderId: number, input: CreateRatingInput) => {
  if (senderId === input.receiverId) {
    throw new Error("You cannot rate yourself");
  }

  const receiver = await getUserById(input.receiverId);
  if (!receiver) {
    throw new Error("Receiver not found");
  }
  if (receiver.type !== "candidate") {
    throw new Error("Only candidates can be rated");
  }

  const existing = await getRatingBySenderReceiverCategory(
    senderId,
    input.receiverId,
    input.category
  );
  if (existing) {
    throw new Error("Rating already exists for this category");
  }

  return createRating({
    senderId,
    receiverId: input.receiverId,
    rating: input.rating,
    category: input.category,
  });
};

export const fetchRatingsForCandidate = async (
  candidateId: number,
  pagination: { limit: number; offset: number }
) => {
  const candidate = await getUserById(candidateId);
  if (!candidate) {
    throw new Error("Candidate not found");
  }
  if (candidate.type !== "candidate") {
    throw new Error("User is not a candidate");
  }

  return getRatingsByReceiverPaginated({ receiverId: candidateId, ...pagination });
};
