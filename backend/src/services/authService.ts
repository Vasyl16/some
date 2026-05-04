import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { createUser, findUserByEmail, type UserType } from "../models/userAuthModel";

interface AuthResult {
  token: string;
  user: {
    _id: number;
    email: string;
    type: UserType;
  };
}

const signToken = (userId: number, type: UserType): string =>
  jwt.sign({ userId, type }, env.jwtSecret, { expiresIn: "1d" });

export const registerUser = async (
  email: string,
  password: string,
  type: UserType
): Promise<AuthResult> => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser(email, hashedPassword, type);
  const token = signToken(user._id, user.type);

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      type: user.type,
    },
  };
};

export const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials");
  }

  const token = signToken(user._id, user.type);

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      type: user.type,
    },
  };
};
