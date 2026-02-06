import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RegionState {
  userCountry: string | null;  // ISO 3166-1 alpha-2 (e.g., 'KR', 'US')
  _hasHydrated: boolean;
}

interface RegionActions {
  setUserCountry: (country: string) => void;
  setHasHydrated: (state: boolean) => void;
}

type RegionStore = RegionState & RegionActions;

const initialState: RegionState = {
  userCountry: null,
  _hasHydrated: false,
};

export const useRegionStore = create<RegionStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUserCountry: (country: string) =>
        set({
          userCountry: country,
        }),
      setHasHydrated: (state: boolean) =>
        set({
          _hasHydrated: state,
        }),
    }),
    {
      name: 'world-lottery-region',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userCountry: state.userCountry,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
