import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

// Client-side: use /api/proxy (relative, goes through Next.js proxy route)
// Server-side (SSR): use BACKEND_URL directly (relative URLs don't work on server)
const getBaseURL = () => {
  if (typeof window === 'undefined') {
    // Server-side: use backend URL directly
    return process.env.BACKEND_URL || 'http://localhost:3001';
  }
  // Client-side: use proxy
  return process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: Inject JWT access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 with token refresh
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use raw axios to avoid interceptor loop
        const { data } = await axios.post(
          `${getBaseURL()}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        // Update tokens in store
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);

        // Retry queued requests with new token
        refreshQueue.forEach(({ resolve }) => resolve(data.accessToken));
        refreshQueue = [];

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Reject all queued requests
        refreshQueue.forEach(({ reject }) => reject(refreshError as Error));
        refreshQueue = [];

        // Clear auth state and logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
