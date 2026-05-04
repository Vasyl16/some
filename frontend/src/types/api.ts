export type UserType = "candidate" | "recruiter";

export interface AuthUser {
  _id: number;
  email: string;
  type: UserType;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Job {
  _id: number;
  userId: number;
  title: string;
  skills: string[];
  jobType: string;
  salary: number;
  duration: number;
  maxApplicants: number;
  maxPositions: number;
  dateOfPosting: string;
  deadline: string;
  activeApplications: number;
  acceptedCandidates: number;
  rating: number;
}

export interface Application {
  _id: number;
  userId: number;
  candidateName?: string | null;
  recruiterId: number;
  jobId: number;
  sop: string;
  status: "pending" | "accepted" | "rejected";
  dateOfApplication: string;
  dateOfJoining: string | null;
}
