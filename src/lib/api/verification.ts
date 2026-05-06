import { apiClient } from "../api-client";

export interface VerificationDocument {
  id: string;
  userId: string;
  idPhotoUrl: string;
  facePhotoUrl: string;
  aiRiskScore: number;
  ipAddress?: string | null;
  deviceFingerprint?: string | null;
  extractedData?: any | null;
  ocrConfidence?: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminComments: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
  };
}

export const verificationApi = {
  submitVerification: (token: string, data: FormData) => {
    return apiClient.post<{ id: string }>(
      "/api/v1/verification/submit",
      data,
      { Authorization: `Bearer ${token}` }
    );
  },
  
  getMyVerification: (token: string) => {
    return apiClient.get<{ verification: VerificationDocument | null }>(
      "/api/v1/verification/me",
      { Authorization: `Bearer ${token}` }
    );
  },
  
  getPendingVerifications: (token: string) => {
    return apiClient.get<{ pending: VerificationDocument[] }>(
      "/api/v1/verification/admin/pending",
      { Authorization: `Bearer ${token}` }
    );
  },
  
  reviewVerification: (
    token: string, 
    id: string, 
    data: { status: "APPROVED" | "REJECTED"; adminComments?: string }
  ) => {
    return apiClient.patch<{ message: string; doc: VerificationDocument }>(
      `/api/v1/verification/admin/${id}`,
      data,
      { Authorization: `Bearer ${token}` }
    );
  }
};
