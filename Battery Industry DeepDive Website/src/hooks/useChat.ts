/**
 * React Hook for Chat/RAG Integration
 * Provides easy-to-use interface for chatbot functionality
 */

import { useState, useCallback, useEffect } from 'react';
import chatService, { type ChatMessage, type ChatResponse } from '../services/chat.service';

export interface UseChatOptions {
  autoLoadHistory?: boolean;
  top_k?: number;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (query: string) => Promise<void>;
  clearConversation: () => Promise<void>;
  submitFeedback: (
    messageId: number,
    rating: number,
    feedbackType: string,
    comment?: string
  ) => Promise<void>;
  sessionId: string | null;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { autoLoadHistory = true, top_k = 5 } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load conversation history on mount
  useEffect(() => {
    if (autoLoadHistory) {
      loadHistory();
    }
  }, [autoLoadHistory]);

  const loadHistory = useCallback(async () => {
    try {
      const history = await chatService.getHistory();
      if (history && history.messages.length > 0) {
        setMessages(history.messages);
        setSessionId(history.session_id);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      // Don't set error state for history loading failures
    }
  }, []);

  const sendMessage = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return;
      }

      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now(),
        role: 'user',
        content: query,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const response: ChatResponse = await chatService.sendMessage(query, {
          top_k,
          include_sources: true,
        });

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.response,
          citations: response.citations,
          confidence_score: response.confidence_score,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setSessionId(response.session_id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);

        // Add error message to chat
        const errorMsg: ChatMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorMessage}. Please try again later or check your backend connection.`,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [top_k]
  );

  const clearConversation = useCallback(async () => {
    try {
      await chatService.deleteConversation();
      setMessages([]);
      setSessionId(null);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear conversation';
      setError(errorMessage);
    }
  }, []);

  const submitFeedback = useCallback(
    async (
      messageId: number,
      rating: number,
      feedbackType: string,
      comment?: string
    ) => {
      try {
        await chatService.submitFeedback(messageId, rating, feedbackType, comment);
      } catch (err) {
        console.error('Failed to submit feedback:', err);
      }
    },
    []
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    submitFeedback,
    sessionId,
  };
}

export default useChat;
