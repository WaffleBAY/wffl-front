'use client';

import { useState, useCallback } from 'react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useAuthStore } from '../store/useAuthStore';
import { getNonce, verifySiwe } from '@/lib/api/auth';

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  isFullyAuthenticated: boolean;
  connectWallet: () => Promise<void>;
  verifyWorldId: () => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isWalletConnected, isWorldIdVerified, setWalletConnected, setTokens, setWorldIdVerified, logout: storeLogout } = useAuthStore();

  const isFullyAuthenticated = isWalletConnected && isWorldIdVerified;

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('World App에서 열어주세요');
      }

      // Step 1: Get nonce from backend (not client-side)
      const nonce = await getNonce();

      // Step 2: Request wallet auth from MiniKit with backend nonce
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        statement: 'World Lottery 앱에 로그인합니다',
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      if (finalPayload.status === 'error') {
        const errorCode = (finalPayload as { error_code?: string }).error_code;
        switch (errorCode) {
          case 'user_rejected':
            throw new Error('지갑 연결이 취소되었습니다');
          default:
            throw new Error('지갑 연결에 실패했습니다');
        }
      }

      // Step 3: Verify SIWE payload with backend and get JWT tokens
      const { accessToken, refreshToken } = await verifySiwe(finalPayload, nonce);

      // Step 4: Store tokens in auth store
      setTokens(accessToken, refreshToken);

      // Step 5: Store wallet address
      setWalletConnected(finalPayload.address);
    } catch (err) {
      const message = err instanceof Error ? err.message : '지갑 연결에 실패했습니다';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setWalletConnected, setTokens]);

  const verifyWorldId = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!MiniKit.isInstalled()) {
        throw new Error('World App에서 열어주세요');
      }

      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: 'lottery-verification', // Must match Developer Portal action
        verification_level: VerificationLevel.Orb,
      });

      if (finalPayload.status === 'error') {
        // Handle specific error codes
        const errorCode = (finalPayload as { error_code?: string }).error_code;
        switch (errorCode) {
          case 'user_rejected':
            throw new Error('인증이 취소되었습니다');
          case 'verification_failed':
            throw new Error('인증에 실패했습니다. 다시 시도해주세요');
          case 'max_verifications_reached':
            throw new Error('이미 인증을 완료했습니다');
          case 'credential_unavailable':
            throw new Error('Orb 인증이 필요합니다. World App에서 Orb 인증을 먼저 완료해주세요');
          default:
            throw new Error('WorldID 인증에 실패했습니다');
        }
      }

      // Success - mark as verified
      setWorldIdVerified();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'WorldID 인증에 실패했습니다';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setWorldIdVerified]);

  const logout = useCallback(() => {
    storeLogout();
    setError(null);
  }, [storeLogout]);

  return {
    isLoading,
    error,
    isFullyAuthenticated,
    connectWallet,
    verifyWorldId,
    logout,
  };
}
