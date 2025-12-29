// UI state store with localStorage persistence
// Manages panel collapse state, active tabs, and other UI preferences

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Panel state
  isPanelCollapsed: boolean;
  activeTab: string;
  // First-time modal
  hasSeenWelcome: boolean;
}

interface UIActions {
  setIsPanelCollapsed: (collapsed: boolean) => void;
  togglePanelCollapsed: () => void;
  setActiveTab: (tab: string) => void;
  dismissWelcome: () => void;
}

type UIStore = UIState & UIActions;

const defaultState: UIState = {
  isPanelCollapsed: false,
  activeTab: 'shape',
  hasSeenWelcome: false,
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      ...defaultState,

      setIsPanelCollapsed: (isPanelCollapsed) => set({ isPanelCollapsed }),

      togglePanelCollapsed: () =>
        set((state) => ({ isPanelCollapsed: !state.isPanelCollapsed })),

      setActiveTab: (activeTab) => set({ activeTab }),

      dismissWelcome: () => set({ hasSeenWelcome: true }),
    }),
    {
      name: 'ui-store',
    }
  )
);

export type { UIState, UIStore };