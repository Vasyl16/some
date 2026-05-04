import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("email format is invalid"),
    password: z
      .string()
      .min(6, "password must be at least 6 characters")
      .max(100, "password is too long"),
    type: z.enum(["candidate", "recruiter"], {
      message: "type must be candidate or recruiter",
    }),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email("email format is invalid"),
    password: z.string().min(1, "password is required"),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
