import { apiClient } from "../api-client";

export const supportApi = {
  getFaqs: async () => {
    return apiClient.get<any[]>("/api/v1/support/faqs");
  },

  createReport: async (
    token: string,
    data: { reportedId?: string; reason: string; description: string }
  ) => {
    return apiClient.post<any>("/api/v1/support/reports", data, {
      Authorization: `Bearer ${token}`,
    });
  },

  createTicket: async (token: string, data: { subject: string; description: string }) => {
    return apiClient.post<any>("/api/v1/support/tickets", data, {
      Authorization: `Bearer ${token}`,
    });
  },

  getUserTickets: async (token: string) => {
    return apiClient.get<any[]>("/api/v1/support/tickets", {
      Authorization: `Bearer ${token}`,
    });
  },

  addTicketMessage: async (token: string, ticketId: string, content: string) => {
    return apiClient.post<any>(`/api/v1/support/tickets/${ticketId}/messages`, { content }, {
      Authorization: `Bearer ${token}`,
    });
  },
};
