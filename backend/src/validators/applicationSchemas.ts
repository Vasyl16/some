import { z } from "zod";

export const createApplicationSchema = z
  .object({
    jobId: z.number().int().positive(),
    sop: z.string().max(3000).optional(),
  })
  .strict();

export const updateApplicationStatusSchema = z
  .object({
    status: z.enum(["accepted", "rejected"]),
    dateOfJoining: z.string().min(8).max(40).optional(),
  })
  .strict();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
