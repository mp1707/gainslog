import { useCallback, useEffect, useState } from "react";
import type { TextInput as RNTextInput } from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { processImage } from "@/utils/processImage";
import { showErrorToast } from "@/lib/toast";
import type { FoodLog } from "@/types/models";

interface UseImageProcessorParams {
  draftId: string | null;
  pendingImageUri: string | undefined;
  updateDraft: (id: string, updates: Partial<FoodLog>) => void;
  textInputRef: React.RefObject<RNTextInput | null>;
}

export const useImageProcessor = ({
  draftId,
  pendingImageUri,
  updateDraft,
  textInputRef,
}: UseImageProcessorParams) => {
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { t } = useTranslation();

  const handleNewImageSelected = useCallback(
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
          pendingImageUri: undefined,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        });
        textInputRef.current?.focus();
      }
    },
    [draftId, updateDraft, textInputRef, t]
  );

  const handleRemoveImage = useCallback(() => {
    if (!draftId) return;
    updateDraft(draftId, {
      localImagePath: undefined,
      supabaseImagePath: undefined,
      pendingImageUri: undefined,
    });
    textInputRef.current?.focus();
  }, [draftId, updateDraft, textInputRef]);

  useEffect(() => {
    if (pendingImageUri) {
      handleNewImageSelected(pendingImageUri);
    }
  }, [pendingImageUri, handleNewImageSelected]);

  return {
    handleNewImageSelected,
    handleRemoveImage,
    isProcessingImage,
  };
};
