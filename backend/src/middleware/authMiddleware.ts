import { type NextFunction, type Request, type Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { type UserType } from "../models/userAuthModel";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    type: UserType;
  };
}

interface TokenPayload extends JwtPayload {
  userId: number;
  type: UserType;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const userId = Number(decoded.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }
    req.user = {
      userId,
      type: decoded.type,
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize =
  (...allowedRoles: UserType[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(req.user.type)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
