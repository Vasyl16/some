import { getDb, getNextSequence } from "../config/db";

export type UserType = "candidate" | "recruiter";

export interface UserAuth {
  _id: number;
  email: string;
  password: string;
  type: UserType;
}

export const findUserByEmail = async (email: string): Promise<UserAuth | null> => {
  const db = getDb();
  return db.collection<UserAuth>("userauths").findOne({ email });
};

export const createUser = async (
  email: string,
  password: string,
  type: UserType
): Promise<UserAuth> => {
  const db = getDb();
  const _id = await getNextSequence("userauths");
  const user: UserAuth = { _id, email, password, type };
  await db.collection<UserAuth>("userauths").insertOne(user);
  return user;
};
