'use client';

import { Sheet } from 'react-modal-sheet';
import { MiniKit } from '@worldcoin/minikit-js';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/useAuthStore';
import { WorldIdBadge } from './WorldIdBadge';

interface LoginBottomSheetProps {
  isOpen: boolean;
}

export function LoginBottomSheet({ isOpen }: LoginBottomSheetProps) {
  const { isLoading, error, debugStep, connectWallet, verifyWorldId } = useAuth();
  const { isWalletConnected, isWorldIdVerified, setDevMode } = useAuthStore();

  const isMiniKitInstalled = typeof window !== 'undefined' && MiniKit.isInstalled();
  const isDev = process.env.NODE_ENV === 'development';

  const handleDevModeLogin = () => {
    setDevMode(true);
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch {
      // Error is already set in useAuth hook
    }
  };

  const handleVerifyWorldId = async () => {
    try {
      await verifyWorldId();
    } catch {
      // Error is already set in useAuth hook
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={() => {}} // Cannot close - mandatory login
      snapPoints={[0, 1]}
      initialSnap={1}
      disableDrag
    >
      <Sheet.Container>
        <Sheet.Header />
        <Sheet.Content>
          <div className="flex flex-col items-center px-6 pb-8">
            {/* App Logo/Title */}
            <h1 className="mb-2 text-2xl font-bold text-gray-900">World Raffle</h1>
            <p className="mb-8 text-center text-sm text-gray-500">
              실물 경품 복권 마켓플레이스
            </p>

            {/* Show message if not in World App */}
            {!isMiniKitInstalled && (
              <div className="w-full rounded-xl bg-yellow-50 p-4 text-center">
                <p className="text-sm font-medium text-yellow-800">
                  World App에서 열어주세요
                </p>
                <p className="mt-1 text-xs text-yellow-600">
                  이 앱은 World App 내에서만 사용할 수 있습니다
                </p>
              </div>
            )}

            {/* Step 1: Wallet Connection */}
            {isMiniKitInstalled && !isWalletConnected && (
              <div className="w-full">
                <button
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-base font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      연결 중...
                    </>
                  ) : (
                    'World App으로 연결'
                  )}
                </button>

                {/* Debug step display */}
                {debugStep && (
                  <p className="mt-3 text-center text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    [Debug] {debugStep}
                  </p>
                )}

                {error && (
                  <p className="mt-3 text-center text-sm text-red-600">{error}</p>
                )}
              </div>
            )}

            {/* Step 2: WorldID Verification */}
            {isMiniKitInstalled && isWalletConnected && !isWorldIdVerified && (
              <div className="w-full">
                {/* Success message for wallet connection */}
                <div className="mb-6 rounded-xl bg-green-50 p-4 text-center">
                  <svg
                    className="mx-auto mb-2 h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-medium text-green-800">
                    지갑이 연결되었습니다
                  </p>
                </div>

                {/* WorldID Badge */}
                <div className="mb-6 flex justify-center">
                  <WorldIdBadge verified={false} />
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerifyWorldId}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-base font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      인증 중...
                    </>
                  ) : (
                    'WorldID 인증하기'
                  )}
                </button>

                {/* Help text */}
                <p className="mt-3 text-center text-sm text-gray-500">
                  World App에서 인증을 완료해주세요
                </p>

                {/* Error message with retry option */}
                {error && (
                  <div className="mt-4 rounded-xl bg-red-50 p-4">
                    <p className="text-center text-sm text-red-600">{error}</p>
                    <button
                      onClick={handleVerifyWorldId}
                      disabled={isLoading}
                      className="mt-3 w-full rounded-lg bg-red-100 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                    >
                      다시 시도
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Dev Mode Toggle - Only in development */}
            {isDev && (
              <div className="mt-8 w-full border-t border-gray-200 pt-6">
                <button
                  onClick={handleDevModeLogin}
                  className="w-full rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 py-3 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100"
                >
                  🛠 개발자 모드로 진입
                </button>
                <p className="mt-2 text-center text-xs text-gray-400">
                  개발 환경에서만 표시됩니다
                </p>
              </div>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
}
