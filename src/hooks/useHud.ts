import { useHudStore, HudType } from "@/store/useHudStore";

interface ShowHudConfig {
  type: HudType;
  title: string;
  subtitle?: string;
  duration?: number;
}

export const useHud = () => {
  const { show, hide } = useHudStore();

  return {
    show,
    hide,
    // Convenience methods for common use cases
    showSuccess: (title: string, subtitle?: string, duration?: number) =>
      show({ type: "success", title, subtitle, duration }),
    showInfo: (title: string, subtitle?: string, duration?: number) =>
      show({ type: "info", title, subtitle, duration }),
    showError: (title: string, subtitle?: string, duration?: number) =>
      show({ type: "error", title, subtitle, duration }),
    // Specific methods for favorites (maintaining backward compatibility)
    showFavoriteAdded: (mealTitle: string) =>
      show({ type: "success", title: "Favorited", subtitle: mealTitle }),
    showFavoriteRemoved: (mealTitle: string) =>
      show({ type: "info", title: "Removed", subtitle: mealTitle }),
  };
};