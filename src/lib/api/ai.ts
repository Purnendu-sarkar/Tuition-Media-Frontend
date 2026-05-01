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
};
