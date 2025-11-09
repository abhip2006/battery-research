/**
 * Chat/RAG Service
 * Integrates with the RAG chatbot backend
 */

import apiClient from '../lib/api-client';

const ENABLE_RAG = import.meta.env.VITE_ENABLE_RAG_CHATBOT !== 'false';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence_score?: number;
  created_at: string;
}

export interface Citation {
  citation_id: number;
  source_document: string;
  section_title?: string | null;
  similarity_score: number;
  chunk_id: number;
}

export interface ChatResponse {
  response: string;
  citations: Citation[];
  confidence_score: number;
  session_id: string;
  model: string;
  response_time_ms: number;
  retrieved_chunks: number;
}

export interface ConversationHistory {
  session_id: string;
  messages: ChatMessage[];
  total_messages: number;
}

class ChatService {
  private sessionId: string | null = null;

  constructor() {
    // Try to restore session from localStorage
    this.sessionId = localStorage.getItem('chat_session_id');
  }

  private saveSessionId(sessionId: string) {
    this.sessionId = sessionId;
    localStorage.setItem('chat_session_id', sessionId);
  }

  private clearSessionId() {
    this.sessionId = null;
    localStorage.removeItem('chat_session_id');
  }

  async sendMessage(
    query: string,
    options?: {
      top_k?: number;
      include_sources?: boolean;
    }
  ): Promise<ChatResponse> {
    if (!ENABLE_RAG) {
      throw new Error('RAG chatbot is disabled');
    }

    try {
      const payload = {
        query,
        session_id: this.sessionId,
        top_k: options?.top_k || 5,
        include_sources: options?.include_sources !== false,
      };

      const response = await apiClient.post<ChatResponse>('/chat/query', payload);

      // Save session ID for continuity
      if (response.session_id) {
        this.saveSessionId(response.session_id);
      }

      return response;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  async getHistory(limit: number = 50): Promise<ConversationHistory | null> {
    if (!this.sessionId || !ENABLE_RAG) {
      return null;
    }

    try {
      const response = await apiClient.get<ConversationHistory>(
        `/chat/history/${this.sessionId}`,
        { limit: String(limit) }
      );

      return response;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return null;
    }
  }

  async deleteConversation(): Promise<void> {
    if (!this.sessionId || !ENABLE_RAG) {
      return;
    }

    try {
      await apiClient.delete(`/chat/conversation/${this.sessionId}`);
      this.clearSessionId();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  async submitFeedback(
    messageId: number,
    rating: number,
    feedbackType: string,
    comment?: string
  ): Promise<void> {
    if (!ENABLE_RAG) {
      return;
    }

    try {
      await apiClient.post('/chat/feedback', {
        message_id: messageId,
        rating,
        feedback_type: feedbackType,
        comment,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<{
    status: string;
    services: Record<string, boolean>;
  }> {
    if (!ENABLE_RAG) {
      return {
        status: 'disabled',
        services: {},
      };
    }

    try {
      return await apiClient.get('/chat/health');
    } catch (error) {
      console.error('Error checking chat health:', error);
      throw error;
    }
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  clearSession(): void {
    this.clearSessionId();
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
