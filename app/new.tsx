import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";

import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/theme/ThemeProvider";
import { useTranscription } from "@/hooks/useTranscription";
import { useEstimation } from "@/hooks/useEstimation";
import { useCreationStore } from "@/store/useCreationStore";
import { useDraft } from "@/hooks/useDraft";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { useTranscriptionSync } from "@/hooks/create-page/useTranscriptionSync";
import { useFavoritesFilter } from "@/hooks/create-page/useFavoritesFilter";
import { useImageProcessor } from "@/hooks/create-page/useImageProcessor";
import { useCreateHandlers } from "@/hooks/create-page/useCreateHandlers";
import { KeyboardAccessory } from "@/components/create-page/KeyboardAccessory/KeyboardAccessory";
import { CreateHeader } from "@/components/create-page/CreateHeader";
import { CreatePaywallView } from "@/components/create-page/CreatePaywallView";
import { TypingModeView } from "@/components/create-page/TypingModeView";
import { CameraModeView } from "@/components/create-page/CameraModeView";
import { RecordingModeView } from "@/components/create-page/RecordingModeView";
import type { CreationMode } from "@/types/creation";
import { createStyles } from "./new.styles";

export default function Create() {
  const { t } = useTranslation();
  const router = useSafeRouter();
  const { theme, colors, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(theme, colors, colorScheme),
    [theme, colors, colorScheme]
  );
  const isIOS = Platform.OS === "ios";

  // Get initial mode from query params
  const params = useLocalSearchParams<{ mode?: CreationMode }>();
  const [mode, setMode] = useState<CreationMode>(params.mode || "typing");

  const { startNewDraft, clearDraft, updateDraft } = useCreationStore();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const draft = useDraft(draftId);
  const favorites = useAppStore((state) => state.favorites);
  const { selectedDate, addFoodLog } = useAppStore();
  const isPro = useAppStore((state) => state.isPro);
  const isVerifyingSubscription = useAppStore(
    (state) => state.isVerifyingSubscription
  );

  const { runCreateEstimation } = useEstimation();
  const {
    requestPermission,
    isRecording,
    isTransitioning,
    liveTranscription,
    volumeLevel,
    stopRecording,
    startRecording,
  } = useTranscription();

  const {
    handleCancel,
    handleOpenExplainer,
    handleShowPaywall,
    handleEstimation: handleEstimationBase,
    handleDescriptionChange,
    handleCreateLogFromFavorite,
    handleSwitchToCamera,
    handleSwitchToRecording,
    handleStopRecording: handleStopRecordingBase,
  } = useCreateHandlers({
    router,
    draft,
    isPro,
    isEstimating,
    selectedDate,
    draftId,
    updateDraft,
    addFoodLog,
    runCreateEstimation,
    setMode,
    requestPermission,
    startRecording,
    stopRecording,
  });

  const { handleImageSelected, handleRemoveImage, isProcessingImage } =
    useImageProcessor(draftId, updateDraft);

  const filteredFavorites = useFavoritesFilter(
    favorites,
    draft?.description ?? ""
  );

  useTranscriptionSync({
    draft,
    isRecording,
    liveTranscription,
    updateDraft,
  });

  useEffect(() => {
    const id = startNewDraft(selectedDate);
    setDraftId(id);
    return () => {
      clearDraft(id);
    };
  }, [startNewDraft, clearDraft, selectedDate]);

  const handleEstimation = () => {
    setIsEstimating(true);
    handleEstimationBase();
  };

  const handleImageProcessed = (uri: string) => {
    handleImageSelected(uri);
    setMode("typing");
  };

  const handleStopRecording = () => {
    handleStopRecordingBase();
  };

  const canContinue =
    (draft?.description?.trim() !== "" || !!draft?.localImagePath) &&
    !isEstimating;

  if (!draft) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CreateHeader
        onCancel={handleCancel}
        onOpenExplainer={handleOpenExplainer}
      />
      {isVerifyingSubscription ? (
        <View style={styles.centerContent}>
          <ActivityIndicator />
        </View>
      ) : !isPro ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
        >
          <CreatePaywallView onShowPaywall={handleShowPaywall} />
        </ScrollView>
      ) : (
        <>
          {mode === "typing" && (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              contentInsetAdjustmentBehavior="automatic"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={isIOS ? "interactive" : "on-drag"}
            >
              <TypingModeView
                draft={draft}
                filteredFavorites={filteredFavorites}
                isProcessingImage={isProcessingImage}
                onDescriptionChange={handleDescriptionChange}
                onSelectFavorite={handleCreateLogFromFavorite}
                onRemoveImage={handleRemoveImage}
              />
            </ScrollView>
          )}

          {mode === "camera" && (
            <CameraModeView onImageSelected={handleImageProcessed} />
          )}

          {mode === "recording" && (
            <RecordingModeView
              volumeLevel={volumeLevel}
              isRecording={isRecording}
              isTransitioning={isTransitioning}
              onStopRecording={handleStopRecording}
            />
          )}

          {mode === "typing" && (
            <KeyboardStickyView offset={{ closed: -30, opened: 20 }}>
              <KeyboardAccessory
                onSwitchToCamera={handleSwitchToCamera}
                onSwitchToRecording={handleSwitchToRecording}
                onEstimate={handleEstimation}
                canContinue={canContinue}
                isEstimating={isEstimating}
              />
            </KeyboardStickyView>
          )}
        </>
      )}
    </View>
  );
}
