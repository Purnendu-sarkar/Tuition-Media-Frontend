import { apiClient } from "../api-client";

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  location: string | null;
  status: string;
  createdAt: string;
  guardian: {
    name: string;
    image: string | null;
  };
  _count: {
    applications: number;
  };
}

export const jobApi = {
  getAllJobs: () => {
    return apiClient.get<Job[]>("/api/v1/jobs");
  },
  
  getJobById: (id: string) => {
    return apiClient.get<Job>(`/api/v1/jobs/${id}`);
  },

  applyForJob: (id: string, token: string, data: { coverLetter?: string }) => {
    return apiClient.post<{ id: string; status: string }>(
      `/api/v1/jobs/${id}/apply`,
      data,
      {
        Authorization: `Bearer ${token}`,
      }
    );
  },
};
