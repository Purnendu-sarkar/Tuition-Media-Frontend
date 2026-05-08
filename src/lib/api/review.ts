import { apiClient } from "../api-client";

export interface CreateReviewData {
  rating: number;
  comment?: string;
  revieweeId: string;
  jobId?: string;
}

export const reviewApi = {
  createReview: (token: string, data: CreateReviewData) => {
    return apiClient.post("/api/v1/reviews", data, {
      Authorization: `Bearer ${token}`
    });
  },
};
