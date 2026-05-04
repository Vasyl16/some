import { z } from "zod";
import { topsisWeightsSchema } from "./topsisSchemas";

export const bestCandidatesSchema = topsisWeightsSchema
  .extend({
    topN: z.number().int().positive().max(100).optional(),
  })
  .strict();

export type BestCandidatesInput = z.infer<typeof bestCandidatesSchema>;
