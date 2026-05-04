import { type NextFunction, type Request, type Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";

export const validateBody =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const unknownFieldIssue = error.issues.find((issue) => issue.code === "unrecognized_keys");
        if (unknownFieldIssue && "keys" in unknownFieldIssue) {
          res.status(400).json({
            message: "Unknown fields are not allowed",
            unknownFields: unknownFieldIssue.keys,
          });
          return;
        }

        res.status(400).json({
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join(".") || "body",
            message: issue.message,
          })),
        });
        return;
      }

      res.status(400).json({ message: "Invalid request body" });
    }
  };
