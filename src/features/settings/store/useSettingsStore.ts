import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  pushEnabled: boolean;
  _hasHydrated: boolean;
}

interface SettingsActions {
  setPushEnabled: (enabled: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

type SettingsStore = SettingsState & SettingsActions;

const initialState: SettingsState = {
  pushEnabled: true, // Default: enabled
  _hasHydrated: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...initialState,
      setPushEnabled: (enabled: boolean) =>
        set({
          pushEnabled: enabled,
        }),
      setHasHydrated: (state: boolean) =>
        set({
          _hasHydrated: state,
        }),
    }),
    {
      name: 'world-lottery-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pushEnabled: state.pushEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
