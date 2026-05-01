import { apiClient } from "../api-client";

export interface MessageUser {
  id: string;
  name: string;
  image: string | null;
  role?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: MessageUser;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantOneId: string;
  participantTwoId: string;
  participantOne: MessageUser;
  participantTwo: MessageUser;
  messages: ChatMessage[];
  updatedAt: string;
}

export const messageApi = {
  getConversations: (token: string) => {
    return apiClient.get<{ conversations: Conversation[] }>("/api/v1/messages/conversations", {
      Authorization: `Bearer ${token}`
    });
  },

  getConversationHistory: (token: string, conversationId: string) => {
    return apiClient.get<{ conversation: Conversation }>(`/api/v1/messages/${conversationId}`, {
      Authorization: `Bearer ${token}`
    });
  },

  initiateConversation: (token: string, targetUserId: string) => {
    return apiClient.post<{ conversation: Conversation }>("/api/v1/messages/initiate", 
      { targetUserId },
      { Authorization: `Bearer ${token}` }
    );
  }
};
