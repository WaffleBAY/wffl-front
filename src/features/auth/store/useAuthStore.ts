import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  walletAddress: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isWalletConnected: boolean;
  isWorldIdVerified: boolean;
  isDevMode: boolean;
  _hasHydrated: boolean;
}

interface AuthActions {
  setWalletConnected: (address: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setWorldIdVerified: () => void;
  setDevMode: (enabled: boolean) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  walletAddress: null,
  accessToken: null,
  refreshToken: null,
  isWalletConnected: false,
  isWorldIdVerified: false,
  isDevMode: false,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setWalletConnected: (address: string) =>
        set({
          walletAddress: address,
          isWalletConnected: true,
        }),
      setTokens: (accessToken: string, refreshToken: string) =>
        set({
          accessToken,
          refreshToken,
        }),
      setWorldIdVerified: () =>
        set({
          isWorldIdVerified: true,
        }),
      setDevMode: (enabled: boolean) =>
        set({
          isDevMode: enabled,
        }),
      logout: () =>
        set({
          walletAddress: null,
          accessToken: null,
          refreshToken: null,
          isWalletConnected: false,
          isWorldIdVerified: false,
        }),
      setHasHydrated: (state: boolean) =>
        set({
          _hasHydrated: state,
        }),
    }),
    {
      name: 'world-lottery-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isWalletConnected: state.isWalletConnected,
        isWorldIdVerified: state.isWorldIdVerified,
        isDevMode: state.isDevMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
