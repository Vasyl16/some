import { getDb, getNextSequence } from "../config/db";

interface Rating {
  _id: number;
  rating: number;
  category: string;
  receiverId: number;
  senderId: number;
}
interface UserAuthRef {
  _id: number;
  type: "candidate" | "recruiter";
}

export const getUserById = async (userId: number) => {
  return getDb().collection<UserAuthRef>("userauths").findOne({ _id: userId });
};

export const getRatingBySenderReceiverCategory = async (
  senderId: number,
  receiverId: number,
  category: string
) => {
  return getDb().collection<Rating>("ratings").findOne({ senderId, receiverId, category });
};

export const createRating = async (input: {
  senderId: number;
  receiverId: number;
  rating: number;
  category: string;
}) => {
  const db = getDb();
  const created: Rating = { _id: await getNextSequence("ratings"), ...input };
  await db.collection<Rating>("ratings").insertOne(created);
  return created;
};

export const getRatingsByReceiver = async (receiverId: number) =>
  getDb().collection<Rating>("ratings").find({ receiverId }).toArray();

export const getRatingsByReceiverPaginated = async (args: {
  receiverId: number;
  limit: number;
  offset: number;
}) => {
  const db = getDb();
  const total = await db.collection<Rating>("ratings").countDocuments({ receiverId: args.receiverId });
  const items = await db
    .collection<Rating>("ratings")
    .find({ receiverId: args.receiverId })
    .sort({ _id: -1 })
    .skip(args.offset)
    .limit(args.limit)
    .toArray();

  return { total, items };
};
