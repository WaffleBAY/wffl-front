'use client';

import { useState, useCallback } from 'react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';
import { useAuthStore } from '../store/useAuthStore';
import { verifySiwe } from '@/lib/api/auth';

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  debugStep: string;
  isFullyAuthenticated: boolean;
  connectWallet: () => Promise<void>;
  verifyWorldId: () => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugStep, setDebugStep] = useState<string>('');

  const { isWalletConnected, isWorldIdVerified, setWalletConnected, setTokens, setWorldIdVerified, logout: storeLogout } = useAuthStore();

  const isFullyAuthenticated = isWalletConnected && isWorldIdVerified;

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setDebugStep('시작');

    try {
      setDebugStep('MiniKit 확인 중...');

      if (!MiniKit.isInstalled()) {
        throw new Error('World App에서 열어주세요');
      }

      // Generate nonce client-side (like HAVO reference)
      const nonce = crypto.randomUUID().replace(/-/g, '');

      setDebugStep('walletAuth 호출 중...');

      // Call walletAuth (HAVO style - simple params)
      const result = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        statement: 'Sign in to World Lottery',
      });

      setDebugStep(`응답: ${result.finalPayload.status}`);

      if (result.finalPayload.status === 'error') {
        const errorCode = (result.finalPayload as { error_code?: string }).error_code;
        switch (errorCode) {
          case 'user_rejected':
            throw new Error('지갑 연결이 취소되었습니다');
          default:
            throw new Error(`지갑 연결 실패: ${errorCode || 'unknown'}`);
        }
      }

      const { address } = result.finalPayload;

      setDebugStep('서버 인증 중...');

      // Verify with backend and get JWT tokens
      const { accessToken, refreshToken } = await verifySiwe(result.finalPayload, nonce);

      // Store tokens and wallet address
      setTokens(accessToken, refreshToken);
      setWalletConnected(address);

      setDebugStep('완료!');
    } catch (err) {
      const message = err instanceof Error ? err.message : '지갑 연결에 실패했습니다';
      setError(message);
      setDebugStep(`에러: ${message}`);
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
        action: 'lottery-verification',
        verification_level: VerificationLevel.Orb,
      });

      if (finalPayload.status === 'error') {
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
    debugStep,
    isFullyAuthenticated,
    connectWallet,
    verifyWorldId,
    logout,
  };
}
