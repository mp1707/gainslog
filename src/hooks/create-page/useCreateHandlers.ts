import { useCallback } from "react";
import * as Haptics from "expo-haptics";
import type { FoodLog, Favorite } from "@/types/models";
import { generateFoodLogId } from "@/utils/idGenerator";

interface UseCreateHandlersParams {
  router: ReturnType<typeof import("@/hooks/useSafeRouter").useSafeRouter>;
  draft: FoodLog | undefined;
  isPro: boolean;
  isEstimating: boolean;
  selectedDate: string;
  draftId: string | null;
  updateDraft: (id: string, updates: Partial<FoodLog>) => void;
  addFoodLog: (log: any) => void;
  runCreateEstimation: (draft: FoodLog) => void;
}

export const useCreateHandlers = ({
  router,
  draft,
  isPro,
  isEstimating,
  selectedDate,
  draftId,
  updateDraft,
  addFoodLog,
  runCreateEstimation,
}: UseCreateHandlersParams) => {
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleOpenExplainer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/explainer-ai-estimation");
  }, [router]);

  const handleShowPaywall = useCallback(() => {
    router.push("/paywall");
  }, [router]);

  const handleEstimation = useCallback(() => {
    if (!draft || !isPro || isEstimating) {
      if (!isPro) {
        handleShowPaywall();
      }
      return;
    }
    runCreateEstimation(draft);
    router.back();
  }, [draft, isPro, isEstimating, runCreateEstimation, router, handleShowPaywall]);

  const handleDescriptionChange = useCallback(
    (description: string) => {
      if (!draftId) return;
      updateDraft(draftId, { description });
    },
    [draftId, updateDraft]
  );

  const handleCreateLogFromFavorite = useCallback(
    (favorite: Favorite) => {
      addFoodLog({
        ...favorite,
        logDate: selectedDate,
        createdAt: new Date().toISOString(),
        isEstimating: false,
        needsUserReview: false,
        id: generateFoodLogId(),
      });
      router.back();
    },
    [addFoodLog, selectedDate, router]
  );

  return {
    handleCancel,
    handleOpenExplainer,
    handleShowPaywall,
    handleEstimation,
    handleDescriptionChange,
    handleCreateLogFromFavorite,
  };
};
