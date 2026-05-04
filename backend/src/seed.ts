import bcrypt from "bcryptjs";
import { connectDB, getDb, getNextSequence } from "./config/db";
import { env } from "./config/env";

type UserType = "candidate" | "recruiter";
type ApplicationStatus = "pending" | "accepted" | "rejected";

interface UserAuthDoc {
  _id: number;
  email: string;
  password: string;
  type: UserType;
}
interface RecruiterInfoDoc {
  _id: number;
  userId: number;
  name: string;
  contactNumber: string;
  bio: string;
}
interface CandidateInfoDoc {
  _id: number;
  userId: number;
  name: string;
  skills: string[];
  rating: number;
  education: string;
  resume: string;
  expectedSalary: number;
  yearsOfExperience: number;
}
interface JobDoc {
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
interface ApplicationDoc {
  _id: number;
  userId: number;
  recruiterId: number;
  jobId: number;
  sop: string;
  status: ApplicationStatus;
  dateOfApplication: string;
  dateOfJoining: string | null;
}
interface RatingDoc {
  _id: number;
  senderId: number;
  receiverId: number;
  category: string;
  rating: number;
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const CANDIDATE_NAMES = [
  "Andrii Koval",
  "Olena Shevchenko",
  "Dmytro Bondarenko",
  "Iryna Melnyk",
  "Maksym Tkachenko",
  "Sofiia Kuznetsova",
  "Bohdan Kravchenko",
  "Kateryna Poliakova",
  "Vladyslav Savchenko",
  "Maria Hrytsenko",
  "Artem Ivanov",
  "Yuliia Moroz",
];

const RECRUITER_NAMES = [
  "TechHire UA",
  "HR Pulse",
  "Violet Talent",
  "Indigo Staffing",
  "Bright Recruit",
  "NextWave HR",
  "Kyiv IT Recruiters",
  "Lviv Talent Hub",
];

const SKILLS_POOL = [
  "react",
  "typescript",
  "nodejs",
  "express",
  "postgresql",
  "drizzle",
  "mongodb",
  "docker",
  "git",
  "tailwind",
  "java",
  "python",
  "csharp",
  "aws",
  "linux",
  "testing",
];

const JOB_TITLES = [
  "Junior Frontend Developer",
  "Full Stack Developer",
  "Backend Developer (Node.js)",
  "QA Engineer",
  "React Developer",
  "DevOps Intern",
  "Junior Data Analyst",
  "Software Engineer (Entry)",
  "TypeScript Developer",
  "Backend Developer (Postgres)",
];

const RATING_CATEGORIES = ["skills", "communication", "experience", "problem_solving"] as const;

async function truncateAll() {
  const db = getDb();
  await Promise.all([
    db.collection("ratings").deleteMany({}),
    db.collection("applications").deleteMany({}),
    db.collection("jobs").deleteMany({}),
    db.collection("recruiterinfos").deleteMany({}),
    db.collection("jobapplicantinfos").deleteMany({}),
    db.collection("userauths").deleteMany({}),
    db.collection("counters").deleteMany({}),
  ]);
}

async function createUsers(count: number, type: UserType, passwordHash: string) {
  const db = getDb();
  const usersCollection = db.collection<UserAuthDoc>("userauths");
  const users: Array<{ _id: number; email: string; type: UserType }> = [];
  for (let i = 1; i <= count; i++) {
    const email = `${type}${i}@example.com`;
    const user = { _id: await getNextSequence("userauths"), email, password: passwordHash, type };
    await usersCollection.insertOne(user);
    users.push({ _id: user._id, email: user.email, type: user.type });
  }
  return users;
}

async function main() {
  console.log("Seeding database...");
  console.log(`DB: ${env.databaseUrl}`);

  await connectDB();
  await truncateAll();

  const passwordHash = await bcrypt.hash("Password123!", 10);
  const specialPasswordHash = await bcrypt.hash("pro100boz1k@gmail.com", 10);

  const recruiters = await createUsers(7, "recruiter", passwordHash);
  const candidates = await createUsers(11, "candidate", passwordHash);

  const db = getDb();
  const userauths = db.collection<UserAuthDoc>("userauths");
  const recruiterinfos = db.collection<RecruiterInfoDoc>("recruiterinfos");
  const jobapplicantinfos = db.collection<CandidateInfoDoc>("jobapplicantinfos");
  const jobs = db.collection<JobDoc>("jobs");
  const applications = db.collection<ApplicationDoc>("applications");
  const ratings = db.collection<RatingDoc>("ratings");
  const specialCandidate = {
    _id: await getNextSequence("userauths"),
    email: "pro100boz1k@gmail.com",
    password: specialPasswordHash,
    type: "candidate" as const,
  };
  await userauths.insertOne(specialCandidate);
  candidates.unshift({ _id: specialCandidate._id, email: specialCandidate.email, type: specialCandidate.type });

  const specialRecruiter = {
    _id: await getNextSequence("userauths"),
    email: "pro100boz1k.recruiter@gmail.com",
    password: specialPasswordHash,
    type: "recruiter" as const,
  };
  await userauths.insertOne(specialRecruiter);
  recruiters.unshift({ _id: specialRecruiter._id, email: specialRecruiter.email, type: specialRecruiter.type });

  // Recruiter profiles
  for (let i = 0; i < recruiters.length; i++) {
    const r = recruiters[i];
    await recruiterinfos.insertOne({
      _id: await getNextSequence("recruiterinfos"),
      userId: r._id,
      name: RECRUITER_NAMES[i % RECRUITER_NAMES.length],
      contactNumber: `+38050${randInt(1000000, 9999999)}`,
      bio: "We hire talented people for real projects.",
    });
  }

  // Candidate profiles
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const skills = shuffle(SKILLS_POOL).slice(0, randInt(4, 8));
    await jobapplicantinfos.insertOne({
      _id: await getNextSequence("jobapplicantinfos"),
      userId: c._id,
      name: CANDIDATE_NAMES[i % CANDIDATE_NAMES.length],
      skills,
      rating: Number((Math.random() * 2 + 3).toFixed(2)), // 3.00 - 5.00
      education: "University (sample education)",
      resume: "",
      expectedSalary: randInt(500, 1500),
      yearsOfExperience: randInt(0, 4),
    });
  }

  // Jobs
  const createdJobs: Array<{ _id: number; userId: number }> = [];
  const jobCount = 25;
  for (let i = 0; i < jobCount; i++) {
    const recruiter = pick(recruiters);
    const skills = shuffle(SKILLS_POOL).slice(0, randInt(4, 7));
    const title = pick(JOB_TITLES);
    const job = {
      _id: await getNextSequence("jobs"),
      userId: recruiter._id,
      title,
      skills,
      jobType: pick(["full-time", "part-time", "internship"]),
      salary: randInt(600, 2500),
      duration: randInt(1, 12),
      maxApplicants: randInt(10, 50),
      maxPositions: randInt(1, 5),
      dateOfPosting: new Date(Date.now() - randInt(1, 30) * 86400000).toISOString(),
      deadline: new Date(Date.now() + randInt(7, 60) * 86400000).toISOString().slice(0, 10),
      activeApplications: 0,
      acceptedCandidates: 0,
      rating: 0,
    };
    await jobs.insertOne(job);
    createdJobs.push({ _id: job._id, userId: job.userId });
  }

  // Ensure specific recruiter has at least 5 jobs.
  const ensuredJobs: Array<{ _id: number; userId: number }> = [];
  for (let i = 0; i < 5; i++) {
    const job = {
      _id: await getNextSequence("jobs"),
      userId: specialRecruiter._id,
      title: `${pick(JOB_TITLES)} (PNU ${i + 1})`,
      skills: shuffle(SKILLS_POOL).slice(0, randInt(4, 7)),
      jobType: "full-time",
      salary: randInt(700, 2200),
      duration: randInt(2, 12),
      maxApplicants: 30,
      maxPositions: randInt(1, 3),
      dateOfPosting: new Date().toISOString(),
      deadline: new Date(Date.now() + randInt(14, 45) * 86400000).toISOString().slice(0, 10),
      activeApplications: 0,
      acceptedCandidates: 0,
      rating: 0,
    };
    await jobs.insertOne(job);
    ensuredJobs.push({ _id: job._id, userId: job.userId });
    createdJobs.push({ _id: job._id, userId: job.userId });
  }

  // Applications (2-6 per job)
  for (const job of createdJobs) {
    const applicants = shuffle(candidates).slice(0, randInt(2, 6));
    for (const candidate of applicants) {
      const status = pick<ApplicationStatus>(["pending", "pending", "accepted", "rejected"]);
      await applications.insertOne({
        _id: await getNextSequence("applications"),
        userId: candidate._id,
        recruiterId: job.userId,
        jobId: job._id,
        sop: "I am motivated and ready to learn.",
        status,
        dateOfApplication: new Date(Date.now() - randInt(0, 15) * 86400000).toISOString(),
        dateOfJoining: null,
      });

      await jobs.updateOne(
        { _id: job._id },
        { $inc: { activeApplications: 1, acceptedCandidates: status === "accepted" ? 1 : 0 } }
      );
    }
  }

  // Ensure each of the 5 special recruiter jobs has at least 10 applications.
  for (const job of ensuredJobs) {
    const existingCount = await applications.countDocuments({ jobId: job._id });
    let need = 10 - existingCount;
    if (need <= 0) continue;

    const poolCandidates = shuffle(candidates);
    let idx = 0;
    while (need > 0 && idx < poolCandidates.length) {
      const candidate = poolCandidates[idx++];
      const already = await applications.findOne({ userId: candidate._id, jobId: job._id });
      if (already) continue;
      const status = pick<ApplicationStatus>(["pending", "accepted", "rejected"]);
      await applications.insertOne({
        _id: await getNextSequence("applications"),
        userId: candidate._id,
        recruiterId: job.userId,
        jobId: job._id,
        sop: "Application for seeded PNU recruiter job.",
        status,
        dateOfApplication: new Date().toISOString(),
        dateOfJoining: null,
      });
      await jobs.updateOne(
        { _id: job._id },
        { $inc: { activeApplications: 1, acceptedCandidates: status === "accepted" ? 1 : 0 } }
      );
      need--;
    }
  }

  // Ratings: recruiters rate random candidates
  for (const recruiter of recruiters) {
    const rated = shuffle(candidates).slice(0, randInt(4, 8));
    for (const candidate of rated) {
      const categories = shuffle([...RATING_CATEGORIES]).slice(0, randInt(1, 3));
      for (const category of categories) {
        await ratings.insertOne({
          _id: await getNextSequence("ratings"),
          senderId: recruiter._id,
          receiverId: candidate._id,
          category,
          rating: randInt(3, 5),
        });
      }
    }
  }

  console.log("Seed completed.");
  console.log("Login credentials (most users): Password123!");
  console.log("Special candidate: pro100boz1k@gmail.com / pro100boz1k@gmail.com");
  console.log("Special recruiter: pro100boz1k.recruiter@gmail.com / pro100boz1k@gmail.com");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Connection is managed by process lifecycle in seed script.
  });

