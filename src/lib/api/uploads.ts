import apiClient from './client';

interface UploadResponse {
  url: string;
}

/**
 * Upload an image file to the backend.
 * @param file - The image file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file); // Field name must be 'image' per backend spec

  const { data } = await apiClient.post<UploadResponse>('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.url;
}
