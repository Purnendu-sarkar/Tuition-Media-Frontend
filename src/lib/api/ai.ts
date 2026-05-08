import { apiClient } from "../api-client";

export const aiApi = {
  generateJobPost: (token: string, prompt: string) => {
    return apiClient.post<{ title: string; description: string }>(
      "/api/v1/ai/generate-job",
      { prompt },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  },
  
  generateCoverLetter: (token: string, jobId: string) => {
    return apiClient.post<{ coverLetter: string }>(
      "/api/v1/ai/generate-cover-letter",
      { jobId },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  },

  optimizeBio: (token: string, bio: string) => {
    return apiClient.post<{ optimizedBio: string }>(
      "/api/v1/ai/optimize-bio",
      { bio },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  },
  
  generateInterview: (token: string, subject: string) => {
    return apiClient.post<{ questions: string[] }>(
      "/api/v1/ai/interview",
      { subject },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  },

  generateResources: (token: string, subject: string) => {
    return apiClient.post<{ guide: string }>(
      "/api/v1/ai/resources",
      { subject },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  },
};
