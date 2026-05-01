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
  };
}

export const tutorApi = {
  getDashboardStats: (token: string) => {
    return apiClient.get<DashboardStats>("/api/v1/tutor/dashboard", {
      Authorization: `Bearer ${token}`,
    });
  },
};
