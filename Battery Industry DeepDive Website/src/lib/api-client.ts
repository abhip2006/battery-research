/**
 * API Client for Battery Industry Intelligence Platform
 * Handles all communication with backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const BASE_PATH = `${API_BASE_URL}/api/${API_VERSION}`;

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_PATH) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };

        try {
          const errorData = await response.json();
          error.details = errorData;
          error.message = errorData.detail || error.message;
        } catch {
          // Response body is not JSON
        }

        throw error;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }

      // Network or other errors
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
        details: error,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${query}`);
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; app: string; version: string }>('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
