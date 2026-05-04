import { getApplicantsForJob, getJobById } from "../models/topsisModel";
import { type TopsisWeightsInput } from "../validators/topsisSchemas";

interface CandidateVector {
  candidateId: number;
  applicationId: number;
  name: string;
  criteria: {
    skills: number;
    experience: number;
    rating: number;
    salary: number;
  };
}

const normalizeWeights = (weights: TopsisWeightsInput) => {
  const sum = weights.skills + weights.experience + weights.rating + weights.salary;
  return {
    skills: weights.skills / sum,
    experience: weights.experience / sum,
    rating: weights.rating / sum,
    salary: weights.salary / sum,
  };
};

const safeDivide = (value: number, divisor: number): number => (divisor === 0 ? 0 : value / divisor);

export const rankCandidatesWithTopsis = async (
  recruiterId: number,
  jobId: number,
  weights: TopsisWeightsInput
) => {
  const job = await getJobById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }
  if (job.userId !== recruiterId) {
    throw new Error("Forbidden");
  }

  const applicants = await getApplicantsForJob(jobId);
  if (applicants.length === 0) {
    return [];
  }

  const requiredSkills = job.skills.map((skill) => skill.toLowerCase());
  const candidates: CandidateVector[] = applicants.map((applicant) => {
    const applicantSkills = applicant.skills.map((skill) => skill.toLowerCase());
    const matchedSkills = requiredSkills.filter((skill) => applicantSkills.includes(skill)).length;
    const skillsScore = requiredSkills.length === 0 ? 0 : (matchedSkills / requiredSkills.length) * 100;

    return {
      candidateId: applicant.candidateId,
      applicationId: applicant.applicationId,
      name: applicant.name,
      criteria: {
        skills: skillsScore,
        experience: applicant.yearsOfExperience,
        rating: applicant.rating,
        salary: applicant.expectedSalary,
      },
    };
  });

  const weight = normalizeWeights(weights);

  const denom = {
    skills: Math.sqrt(candidates.reduce((acc, c) => acc + c.criteria.skills ** 2, 0)),
    experience: Math.sqrt(candidates.reduce((acc, c) => acc + c.criteria.experience ** 2, 0)),
    rating: Math.sqrt(candidates.reduce((acc, c) => acc + c.criteria.rating ** 2, 0)),
    salary: Math.sqrt(candidates.reduce((acc, c) => acc + c.criteria.salary ** 2, 0)),
  };

  const weighted = candidates.map((candidate) => ({
    ...candidate,
    normalized: {
      skills: safeDivide(candidate.criteria.skills, denom.skills) * weight.skills,
      experience: safeDivide(candidate.criteria.experience, denom.experience) * weight.experience,
      rating: safeDivide(candidate.criteria.rating, denom.rating) * weight.rating,
      salary: safeDivide(candidate.criteria.salary, denom.salary) * weight.salary,
    },
  }));

  const idealBest = {
    skills: Math.max(...weighted.map((w) => w.normalized.skills)),
    experience: Math.max(...weighted.map((w) => w.normalized.experience)),
    rating: Math.max(...weighted.map((w) => w.normalized.rating)),
    salary: Math.min(...weighted.map((w) => w.normalized.salary)),
  };

  const idealWorst = {
    skills: Math.min(...weighted.map((w) => w.normalized.skills)),
    experience: Math.min(...weighted.map((w) => w.normalized.experience)),
    rating: Math.min(...weighted.map((w) => w.normalized.rating)),
    salary: Math.max(...weighted.map((w) => w.normalized.salary)),
  };

  const ranked = weighted
    .map((candidate) => {
      const dPlus = Math.sqrt(
        (candidate.normalized.skills - idealBest.skills) ** 2 +
          (candidate.normalized.experience - idealBest.experience) ** 2 +
          (candidate.normalized.rating - idealBest.rating) ** 2 +
          (candidate.normalized.salary - idealBest.salary) ** 2
      );
      const dMinus = Math.sqrt(
        (candidate.normalized.skills - idealWorst.skills) ** 2 +
          (candidate.normalized.experience - idealWorst.experience) ** 2 +
          (candidate.normalized.rating - idealWorst.rating) ** 2 +
          (candidate.normalized.salary - idealWorst.salary) ** 2
      );
      const score = safeDivide(dMinus, dPlus + dMinus);

      return {
        candidateId: candidate.candidateId,
        applicationId: candidate.applicationId,
        name: candidate.name,
        score: Number(score.toFixed(6)),
        criteria: candidate.criteria,
      };
    })
    .sort((a, b) => b.score - a.score);

  return ranked;
};
