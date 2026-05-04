import { z } from "zod";

export const createRatingSchema = z
  .object({
    receiverId: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    category: z.string().min(2).max(50),
  })
  .strict();

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
