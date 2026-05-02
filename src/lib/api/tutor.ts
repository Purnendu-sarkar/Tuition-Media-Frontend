import { apiClient } from "../api-client";

export interface DashboardStats {
  stats: {
    activeApplications: number;
    profileViews: number;
    totalEarnings: number;
    averageRating: number;
  };
  recentApplications: {
    id: string;
    jobTitle: string;
    budget: number | null;
    status: string;
    appliedAt: string;
  }[];
  profileStatus: {
    isVerified: boolean;
    isProfileComplete: boolean;
    completenessScore: number;
    missingSteps: string[];
  };
}

export const tutorApi = {
  getDashboardStats: (token: string) => {
    return apiClient.get<DashboardStats>("/api/v1/tutor/dashboard", {
      Authorization: `Bearer ${token}`,
    });
  },

  getProfile: (token: string) => {
    return apiClient.get<any>("/api/v1/tutor/profile", {
      Authorization: `Bearer ${token}`,
    });
  },

  updateProfile: (token: string, data: any) => {
    return apiClient.put<any>("/api/v1/tutor/profile", data, {
      Authorization: `Bearer ${token}`,
    });
  },
};
