import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { processImage } from "@/utils/processImage";
import { showErrorToast } from "@/lib/toast";
import type { FoodLog } from "@/types/models";

export const useImageProcessor = (
  draftId: string | null,
  updateDraft: (id: string, updates: Partial<FoodLog>) => void
) => {
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { t } = useTranslation();

  const handleImageSelected = useCallback(
    async (uri: string) => {
      if (!draftId) return;

      setIsProcessingImage(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      let result;
      let success = false;

      try {
        result = await processImage(uri);
        success = true;
      } catch (error) {
        showErrorToast(
          t("createLog.toasts.imageProcessing.title"),
          t("createLog.toasts.imageProcessing.message")
        );
      }

      setIsProcessingImage(false);

      if (success && result) {
        const { localImagePath, supabaseImagePath } = result;
        updateDraft(draftId, {
          localImagePath,
          supabaseImagePath,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        });
      }
    },
    [draftId, updateDraft, t]
  );

  const handleRemoveImage = useCallback(() => {
    if (!draftId) return;
    updateDraft(draftId, {
      localImagePath: undefined,
      supabaseImagePath: undefined,
    });
  }, [draftId, updateDraft]);

  return {
    handleImageSelected,
    handleRemoveImage,
    isProcessingImage,
  };
};
