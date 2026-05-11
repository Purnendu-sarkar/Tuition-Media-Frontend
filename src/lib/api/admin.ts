import { apiClient } from "../api-client";

export interface AdminStats {
  totalUsers: number;
  totalTutors: number;
  totalGuardians: number;
  activeJobs: number;
  pendingVerifications: number;
  totalReviews: number;
  averageRating: number;
  totalMessages: number;
  verificationStats: {
    approved: number;
    rejected: number;
    pending: number;
  };
  growth: {
    newUsers7d: number;
    newJobs7d: number;
  };
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

export interface AdminReport {
  id: string;
  reporterId: string;
  reporter: { id: string; name: string; email: string; role: string };
  reportedId: string | null;
  reported: { id: string; name: string; email: string; role: string } | null;
  reason: string;
  description: string;
  status: "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

export interface AdminTicket {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    content: string;
    senderId: string;
    isAdmin: boolean;
    createdAt: string;
  }[];
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
  },

  getReports: (token: string) => {
    return apiClient.get<{ reports: AdminReport[] }>("/api/v1/admin/reports", {
      Authorization: `Bearer ${token}`
    });
  },

  updateReportStatus: (token: string, id: string, status: string) => {
    return apiClient.patch<{ report: AdminReport }>(`/api/v1/admin/reports/${id}`, { status }, {
      Authorization: `Bearer ${token}`
    });
  },

  getTickets: (token: string) => {
    return apiClient.get<{ tickets: AdminTicket[] }>("/api/v1/admin/tickets", {
      Authorization: `Bearer ${token}`
    });
  },

  updateTicketStatus: (token: string, id: string, status: string) => {
    return apiClient.patch<{ ticket: AdminTicket }>(`/api/v1/admin/tickets/${id}`, { status }, {
      Authorization: `Bearer ${token}`
    });
  },

  addTicketMessage: (token: string, id: string, content: string) => {
    return apiClient.post<{ message: any }>(`/api/v1/admin/tickets/${id}/messages`, { content }, {
      Authorization: `Bearer ${token}`
    });
  }
};
