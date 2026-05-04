import { z } from "zod";

const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
};

export const createJobSchema = z
  .object({
    title: z.string().min(2).max(120),
    skills: z.array(z.string().min(1)).max(50),
    jobType: z.string().min(2).max(30),
    salary: z.number().int().nonnegative(),
    duration: z.number().int().positive(),
    maxApplicants: z.number().int().positive(),
    maxPositions: z.number().int().positive(),
    deadline: z
      .string()
      .refine(
        (value) => isValidIsoDate(value),
        "Deadline must be a valid date in YYYY-MM-DD format"
      ),
  })
  .strict();

export const updateJobSchema = createJobSchema.partial().strict();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
