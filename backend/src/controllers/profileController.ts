import { type Response } from 'express';
import { type AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  fetchCandidateProfile,
  fetchRecruiterProfile,
  saveCandidateProfile,
  saveRecruiterProfile,
} from '../services/profileService';
import {
  type CandidateProfileInput,
  type RecruiterProfileInput,
} from '../validators/profileSchemas';

export const upsertRecruiterProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const profile = await saveRecruiterProfile(
      req.user.userId,
      req.body as RecruiterProfileInput,
    );
    res.status(200).json(profile);
  } catch {
    res.status(500).json({ message: 'Failed to save recruiter profile' });
  }
};

export const getRecruiterProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const profile = await fetchRecruiterProfile(req.user.userId);
    if (!profile) {
      res.status(404).json({ message: 'Recruiter profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch {
    res.status(500).json({ message: 'Failed to load recruiter profile' });
  }
};

export const upsertCandidateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const profile = await saveCandidateProfile(
      req.user.userId,
      req.body as CandidateProfileInput,
    );
    res.status(200).json(profile);
  } catch {
    res.status(500).json({ message: 'Failed to save candidate profile' });
  }
};

export const getCandidateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const profile = await fetchCandidateProfile(req.user.userId);

    if (!profile) {
      res.status(200).json({
        _id: null,
        userId: req.user.userId,
        name: '',
        skills: [],
        rating: 0,
        education: '',
        resume: '',
        expectedSalary: 0,
        yearsOfExperience: 0,
      });
      return;
    }

    res.status(200).json(profile);
  } catch {
    res.status(500).json({ message: 'Failed to load candidate profile' });
  }
};
