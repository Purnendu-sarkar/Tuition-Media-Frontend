import { apiClient } from "../api-client";

export interface AdminStats {
  totalUsers: number;
  totalTutors: number;
  totalGuardians: number;
  activeJobs: number;
  pendingVerifications: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  _count: {
    postedJobs: number;
    applications: number;
  };
}

export interface AdminJob {
  id: string;
  title: string;
  guardianId: string;
  guardian: {
    name: string;
    email: string;
  };
  budget: number | null;
  status: string;
  createdAt: string;
  _count: {
    applications: number;
  };
}

export const adminApi = {
  getStats: (token: string) => {
    return apiClient.get<AdminStats>("/api/v1/admin/stats", {
      Authorization: `Bearer ${token}`
    });
  },

  getUsers: (token: string, role?: string) => {
    const url = role ? `/api/v1/admin/users?role=${role}` : "/api/v1/admin/users";
    return apiClient.get<{ users: AdminUser[] }>(url, {
      Authorization: `Bearer ${token}`
    });
  },

  deleteUser: (token: string, userId: string) => {
    return apiClient.delete<{ message: string }>(`/api/v1/admin/users/${userId}`, {
      Authorization: `Bearer ${token}`
    });
  },

  getJobs: (token: string) => {
    return apiClient.get<{ jobs: AdminJob[] }>("/api/v1/admin/jobs", {
      Authorization: `Bearer ${token}`
    });
  },

  deleteJob: (token: string, jobId: string) => {
    return apiClient.delete<{ message: string }>(`/api/v1/admin/jobs/${jobId}`, {
      Authorization: `Bearer ${token}`
    });
  }
};
