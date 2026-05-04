import { getJobById } from "../models/topsisModel";
import { rankCandidatesWithTopsis } from "./topsisService";
import { type BestCandidatesInput } from "../validators/analyticsSchemas";

export const getBestCandidatesForJob = async (
  recruiterId: number,
  jobId: number,
  input: BestCandidatesInput
) => {
  const ranked = await rankCandidatesWithTopsis(recruiterId, jobId, {
    skills: input.skills,
    experience: input.experience,
    rating: input.rating,
    salary: input.salary,
  });

  const job = await getJobById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  const limit = input.topN ?? ranked.length;
  const topCandidates = ranked.slice(0, limit);
  const averageScore =
    topCandidates.length === 0
      ? 0
      : Number(
          (
            topCandidates.reduce((acc, candidate) => acc + candidate.score, 0) /
            topCandidates.length
          ).toFixed(6)
        );

  return {
    job: {
      _id: job._id,
      title: job.title,
      skills: job.skills,
      deadline: job.deadline,
    },
    totalRankedCandidates: ranked.length,
    returnedCandidates: topCandidates.length,
    averageScore,
    topCandidates,
  };
};
