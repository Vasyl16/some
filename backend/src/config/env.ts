import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["PORT", "DATABASE_URL", "JWT_SECRET"] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
};
