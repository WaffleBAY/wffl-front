import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface UploadResponse {
  url: string;
}

const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

/**
 * Refresh token if needed before upload
 */
async function ensureValidToken(): Promise<string> {
  const { accessToken, refreshToken } = useAuthStore.getState();

  if (!accessToken || !refreshToken) {
    throw new Error('로그인이 필요합니다');
  }

  // Try to use current token, refresh if 401
  return accessToken;
}

/**
 * Upload an image file to the backend.
 * Uses direct axios call to avoid FormData retry issues with interceptors.
 * @param file - The image file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  let token = await ensureValidToken();
  const baseUrl = getBaseURL();

  try {
    const { data } = await axios.post<UploadResponse>(
      `${baseUrl}/uploads/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 120000, // 120s timeout for image upload
      }
    );
    return data.url;
  } catch (error) {
    // Handle 401 by refreshing token and retrying once
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) {
        throw new Error('로그인이 필요합니다');
      }

      // Refresh token
      const { data: tokenData } = await axios.post(
        `${baseUrl}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );

      useAuthStore.getState().setTokens(tokenData.accessToken, tokenData.refreshToken);
      token = tokenData.accessToken;

      // Retry with new token - need fresh FormData
      const retryFormData = new FormData();
      retryFormData.append('image', file);

      const { data } = await axios.post<UploadResponse>(
        `${baseUrl}/uploads/image`,
        retryFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 120000,
        }
      );
      return data.url;
    }
    throw error;
  }
}
