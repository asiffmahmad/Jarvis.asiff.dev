import { apiClient } from "@/lib/api";

export const carouselAiService = {
  generateSlideContent: async (topic: string, platform: string) => {
    return apiClient.post<{ content: string }>("/api/carousel/generate", {
      action: "generate_slide",
      topic,
      platform,
    });
  },
  improveWriting: async (text: string) => {
    return apiClient.post<{ content: string }>("/api/carousel/generate", {
      action: "improve",
      text,
    });
  },
};
