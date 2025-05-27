import axios, { AxiosInstance } from 'axios';
import { 
  ImageAnalysisResponse, 
  SessionStatusResponse, 
  CreateSessionResponse 
} from '@/types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.warn('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.warn('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async createSession(): Promise<CreateSessionResponse> {
    try {
      const response = await this.api.post<CreateSessionResponse>('/create-session');
      return response.data;
    } catch (error) {
      console.warn('Failed to create session:', error);
      throw new Error('Failed to create session');
    }
  }

  async analyzeImage(image: string, sessionId?: string): Promise<ImageAnalysisResponse> {
    try {
      const payload = {
        image_data: image,
        ...(sessionId && { session_id: sessionId }),
      };

      const response = await this.api.post<ImageAnalysisResponse>('/analyze-image', payload);
      return response.data;
    } catch (error) {
      console.warn('Failed to analyze image:', error);
      throw new Error('Failed to analyze image');
    }
  }

  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    try {
      const response = await this.api.get<SessionStatusResponse>(`/session/${sessionId}/status`);
      return response.data;
    } catch (error) {
      console.warn('Failed to get session status:', error);
      throw new Error('Failed to get session status');
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();
