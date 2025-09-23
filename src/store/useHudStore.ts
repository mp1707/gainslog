import { create } from "zustand";
import * as Haptics from "expo-haptics";

export type HudType = "success" | "info" | "error";

export interface HudState {
  isVisible: boolean;
  type: HudType;
  title: string;
  subtitle?: string;
  duration: number;
}

interface HudActions {
  show: (config: {
    type: HudType;
    title: string;
    subtitle?: string;
    duration?: number;
  }) => void;
  hide: () => void;
}

type HudStore = HudState & HudActions;

const DEFAULT_DURATIONS = {
  success: 2000,
  info: 2000,
  error: 4000,
} as const;

const HAPTIC_FEEDBACK = {
  success: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not available, continue silently
    }
  },
  info: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available, continue silently
    }
  },
  error: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Haptics not available, continue silently
    }
  },
} as const;

export const useHudStore = create<HudStore>((set, get) => ({
  // Initial state
  isVisible: false,
  type: "info",
  title: "",
  subtitle: undefined,
  duration: DEFAULT_DURATIONS.info,

  // Actions
  show: (config) => {
    const duration = config.duration ?? DEFAULT_DURATIONS[config.type];

    // Trigger haptic feedback
    HAPTIC_FEEDBACK[config.type]();

    // Update state to show HUD
    set({
      isVisible: true,
      type: config.type,
      title: config.title,
      subtitle: config.subtitle,
      duration,
    });

    // Auto-dismiss after duration
    setTimeout(() => {
      const currentState = get();
      // Only hide if this is still the current HUD (prevents race conditions)
      if (
        currentState.isVisible &&
        currentState.type === config.type &&
        currentState.title === config.title
      ) {
        set({ isVisible: false });
      }
    }, duration);
  },

  hide: () => {
    set({ isVisible: false });
  },
}));