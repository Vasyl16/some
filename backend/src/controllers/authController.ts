import { type Request, type Response } from "express";
import { loginUser, registerUser } from "../services/authService";
import { type LoginInput, type RegisterInput } from "../validators/authSchemas";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, type } = req.body as RegisterInput;
    const result = await registerUser(email, password, type);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    const status = message === "User already exists" ? 409 : 500;
    res.status(status).json({ message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    const status = message === "Invalid credentials" ? 401 : 500;
    res.status(status).json({ message });
  }
};
