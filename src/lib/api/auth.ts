import axios from 'axios';
import apiClient from './client';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Raw axios instance for refresh (avoids interceptor loop)
const rawAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Get nonce from backend for SIWE authentication
 * Public endpoint - no auth required
 */
export async function getNonce(): Promise<string> {
  // Use rawAxios to avoid auth interceptor (this is a public endpoint)
  const { data } = await rawAxios.get<{ nonce: string }>('/auth/nonce');
  return data.nonce;
}

/**
 * Verify SIWE payload and get JWT tokens
 * Public endpoint - no auth required
 */
export async function verifySiwe(
  payload: unknown,
  nonce: string
): Promise<{ accessToken: string; refreshToken: string }> {
  // Use rawAxios to avoid auth interceptor (this is a public endpoint)
  const { data } = await rawAxios.post<{
    accessToken: string;
    refreshToken: string;
  }>('/auth/verify', { payload, nonce });
  return data;
}

/**
 * Refresh tokens using refresh token
 * Uses raw axios to avoid interceptor loop
 */
export async function refreshTokens(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const { data } = await rawAxios.post<{
    accessToken: string;
    refreshToken: string;
  }>(
    '/auth/refresh',
    {},
    { headers: { Authorization: `Bearer ${refreshToken}` } }
  );
  return data;
}

/**
 * Logout user - invalidate refresh token on backend
 * Requires auth - uses apiClient
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    // Always clear local state, even if backend call fails
    useAuthStore.getState().logout();
  }
}
