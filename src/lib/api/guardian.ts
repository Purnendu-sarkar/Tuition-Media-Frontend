import { apiClient } from "../api-client";

export interface GuardianDashboardStats {
  stats: {
    totalPostedJobs: number;
    activeJobs: number;
    totalApplicants: number;
  };
  recentJobs: {
    id: string;
    title: string;
    budget: number | null;
    status: string;
    applicantsCount: number;
    createdAt: string;
  }[];
}

export interface CreateJobData {
  title: string;
  description: string;
  budget?: number;
  location?: string;
}

export interface Application {
  id: string;
  jobId: string;
  tutorId: string;
  coverLetter: string | null;
  status: string;
  matchScore: number;
  createdAt: string;
  tutor: {
    name: string;
    image: string | null;
    tutorProfile: {
      bio: string | null;
      hourlyRate: number | null;
      location: string | null;
    } | null;
  };
}

export const guardianApi = {
  getDashboardStats: (token: string) => {
    return apiClient.get<GuardianDashboardStats>("/api/v1/guardian/dashboard", {
      Authorization: `Bearer ${token}`,
    });
  },
  getAllJobs: (token: string) => {
    return apiClient.get<{
      id: string;
      title: string;
      budget: number | null;
      status: string;
      location: string | null;
      description: string;
      applicantsCount: number;
      createdAt: string;
    }[]>("/api/v1/guardian/jobs", {
      Authorization: `Bearer ${token}`,
    });
  },
  createJob: (token: string, data: CreateJobData) => {
    return apiClient.post<{ id: string }>("/api/v1/guardian/jobs", data, {
      Authorization: `Bearer ${token}`,
    });
  },
  getJobApplications: (token: string, jobId: string) => {
    return apiClient.get<Application[]>(`/api/v1/guardian/jobs/${jobId}/applications`, {
      Authorization: `Bearer ${token}`,
    });
  },
  updateApplicationStatus: (token: string, applicationId: string, status: "ACCEPTED" | "REJECTED") => {
    return apiClient.patch<{ id: string; status: string }>(`/api/v1/guardian/applications/${applicationId}/status`, { status }, {
      Authorization: `Bearer ${token}`,
    });
  },
};
