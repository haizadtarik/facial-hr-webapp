import axios, { AxiosInstance } from 'axios';
import { 
  ImageAnalysisResponse, 
  SessionStatusResponse, 
  CreateSessionResponse 
} from '@/types/api';

class ApiService {
  private api: AxiosInstance;
  private useProxy: boolean;

  constructor() {
    // Determine if we should use proxy (when running on Vercel/production)
    this.useProxy = typeof window !== 'undefined' && 
                   (window.location.hostname.includes('vercel.app') || 
                    window.location.protocol === 'https:');
    
    const baseURL = this.useProxy 
      ? '/api'  // Use Next.js API routes as proxy
      : process.env.NEXT_PUBLIC_API_BASE_URL;
    
    console.log('API Service initialized:', {
      baseURL,
      useProxy: this.useProxy,
      environment: typeof window !== 'undefined' ? 'client' : 'server'
    });
    
    if (!baseURL) {
      console.warn('No API base URL configured!');
    }

    this.api = axios.create({
      baseURL,
      timeout: 30000,
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
        // Don't log 404 errors for session deletion as they're expected
        const isSessionDelete = error.config?.url?.includes('/session/') && 
                               error.config?.method === 'delete';
        const is404 = error.response?.status === 404;
        
        if (isSessionDelete && is404) {
          console.log('Session delete 404 (expected):', error.config.url);
        } else {
          console.warn('API Response Error:', error.response?.data || error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async createSession(): Promise<CreateSessionResponse> {
    try {
      console.log('Attempting to create session...');
      const response = await this.api.post<CreateSessionResponse>('/create-session');
      console.log('Session created successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as Error & { 
        code?: string; 
        response?: { status?: number; data?: { detail?: string } } 
      };
      console.warn('Failed to create session - Full error:', errorObj);
      console.warn('Error response:', errorObj.response?.data);
      console.warn('Error status:', errorObj.response?.status);
      console.warn('Error message:', errorObj.message);
      console.warn('Using proxy:', this.useProxy);
      
      // Handle specific API errors
      if (errorObj.response?.status === 429) {
        const errorData = errorObj.response.data;
        if (errorData?.detail === 'Maximum number of sessions reached') {
          throw new Error('API server is at capacity. Please try again in a few minutes or contact support.');
        }
        throw new Error('Too many requests - please wait and try again');
      } else if (errorObj.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to API server - server may be down or unreachable');
      } else if (errorObj.response?.status === 404) {
        throw new Error('API endpoint not found - check API server configuration');
      } else if (errorObj.response?.status && errorObj.response.status >= 500) {
        throw new Error('API server error - please try again later');
      } else if (errorObj.code === 'ENOTFOUND') {
        throw new Error('API server hostname not found - check network connection');
      } else {
        throw new Error(`Failed to create session: ${errorObj.message || 'Unknown error'}`);
      }
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
    } catch (error: unknown) {
      const errorObj = error as Error & { 
        code?: string; 
        response?: { status?: number; data?: unknown } 
      };
      console.warn('Failed to analyze image:', errorObj);
      throw new Error(`Failed to analyze image: ${errorObj.message || 'Unknown error'}`);
    }
  }

  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    try {
      const endpoint = this.useProxy 
        ? `/session/${sessionId}/status`
        : `/session/${sessionId}/status`;
      
      const response = await this.api.get<SessionStatusResponse>(endpoint);
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as Error & { 
        code?: string; 
        response?: { status?: number; data?: { detail?: string } } 
      };
      console.warn('Failed to get session status:', errorObj);
      throw new Error(`Failed to get session status: ${errorObj.message || 'Unknown error'}`);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const endpoint = this.useProxy 
        ? `/session/${sessionId}`
        : `/session/${sessionId}`;
      
      await this.api.delete(endpoint);
      console.log(`Session ${sessionId} deleted successfully`);
    } catch (error: unknown) {
      const errorObj = error as Error & { 
        code?: string; 
        response?: { status?: number; data?: { detail?: string } } 
      };
      
      // Handle specific error cases
      if (errorObj.response?.status === 404) {
        console.log(`Session ${sessionId} was already deleted or doesn't exist`);
        return; // Not an error - session is already gone
      }
      
      console.warn(`Failed to delete session ${sessionId}:`, errorObj.response?.data?.detail || errorObj.message);
      // Don't throw error for delete failures as it's not critical
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();