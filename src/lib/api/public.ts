import { apiClient } from "../api-client";

export interface PublicTutor {
  id: string;
  name: string;
  image: string | null;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  tutorProfile: {
    bio: string | null;
    subjects: string[];
    location: string | null;
    hourlyRate: number | null;
    profileViews: number;
  };
}

export interface PublicJob {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  location: string | null;
  createdAt: string;
  guardian: {
    name: string;
    image: string | null;
    isVerified: boolean;
  };
  _count: {
    applications: number;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TutorsResponse {
  tutors: PublicTutor[];
  pagination: Pagination;
}

export interface JobsResponse {
  jobs: PublicJob[];
  pagination: Pagination;
}

export const publicApi = {
  getTutors: (params: any = {}) => {
    return apiClient.get<TutorsResponse>("/api/v1/public/tutors", { params });
  },
  getTutorById: (id: string) => {
    return apiClient.get<PublicTutor & { reviewsReceived: any[] }>(`/api/v1/public/tutors/${id}`);
  },
  getJobs: (params: any = {}) => {
    return apiClient.get<JobsResponse>("/api/v1/public/jobs", { params });
  },
};
