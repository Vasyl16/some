import { z } from "zod";

export const topsisWeightsSchema = z
  .object({
    skills: z.number().positive(),
    experience: z.number().positive(),
    rating: z.number().positive(),
    salary: z.number().positive(),
  })
  .strict()
  .refine(
    (weights) => weights.skills + weights.experience + weights.rating + weights.salary > 0,
    { message: "At least one weight must be greater than 0" }
  );

export type TopsisWeightsInput = z.infer<typeof topsisWeightsSchema>;
