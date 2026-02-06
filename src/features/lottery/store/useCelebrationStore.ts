import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CelebrationState {
  celebratedLotteries: string[];
  _hasHydrated: boolean;
}

interface CelebrationActions {
  markCelebrated: (lotteryId: string) => void;
  hasCelebrated: (lotteryId: string) => boolean;
  setHasHydrated: (state: boolean) => void;
}

type CelebrationStore = CelebrationState & CelebrationActions;

const initialState: CelebrationState = {
  celebratedLotteries: [],
  _hasHydrated: false,
};

export const useCelebrationStore = create<CelebrationStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      markCelebrated: (lotteryId: string) => {
        if (!get().celebratedLotteries.includes(lotteryId)) {
          set((state) => ({
            celebratedLotteries: [...state.celebratedLotteries, lotteryId],
          }));
        }
      },
      hasCelebrated: (lotteryId: string) => {
        return get().celebratedLotteries.includes(lotteryId);
      },
      setHasHydrated: (state: boolean) =>
        set({
          _hasHydrated: state,
        }),
    }),
    {
      name: 'celebration-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        celebratedLotteries: state.celebratedLotteries,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
