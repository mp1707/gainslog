import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/theme/ThemeProvider";
import { useTranscription } from "@/hooks/useTranscription";
import { useEstimation } from "@/hooks/useEstimation";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { useCreationStore } from "@/store/useCreationStore";
import { useDraft } from "@/hooks/useDraft";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { useTranscriptionSync } from "@/hooks/create-page/useTranscriptionSync";
import { useFavoritesFilter } from "@/hooks/create-page/useFavoritesFilter";
import { useImageProcessor } from "@/hooks/create-page/useImageProcessor";
import { useCreateHandlers } from "@/hooks/create-page/useCreateHandlers";
import { TextInput } from "@/components/shared/TextInput";
import { KeyboardAccessory } from "@/components/create-page/KeyboardAccessory/KeyboardAccessory";
import { CreateHeader } from "@/components/create-page/CreateHeader";
import { CreatePaywallView } from "@/components/create-page/CreatePaywallView";
import { FavoritesSection } from "@/components/create-page/FavoritesSection";
import { ImageSection } from "@/components/create-page/ImageSection";
import { INPUT_ACCESSORY_VIEW_ID } from "@/constants/create";
import { createStyles } from "./new.styles";

export default function Create() {
  const router = useSafeRouter();
  const { theme, colors, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(theme, colors, colorScheme),
    [theme, colors, colorScheme]
  );
  const isIOS = Platform.OS === "ios";

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

  const textInputRef = useRef<RNTextInput>(null);
  useDelayedAutofocus(textInputRef);

  const {
    handleCancel,
    handleOpenExplainer,
    handleShowPaywall,
    handleEstimation: handleEstimationBase,
    handleDescriptionChange,
    handleCreateLogFromFavorite,
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
  });

  const { handleRemoveImage, isProcessingImage } = useImageProcessor({
    draftId,
    pendingImageUri: draft?.pendingImageUri,
    updateDraft,
    textInputRef,
  });

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
      <CreateHeader onCancel={handleCancel} onOpenExplainer={handleOpenExplainer} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={isIOS ? "interactive" : "on-drag"}
      >
        {isVerifyingSubscription ? (
          <View style={styles.centerContent}>
            <ActivityIndicator />
          </View>
        ) : !isPro ? (
          <CreatePaywallView onShowPaywall={handleShowPaywall} />
        ) : (
          <View style={styles.content}>
            <TextInput
              ref={textInputRef}
              value={draft.description || ""}
              onChangeText={handleDescriptionChange}
              placeholder="e.g. 100g of chicken breast"
              multiline
              inputAccessoryViewID={INPUT_ACCESSORY_VIEW_ID}
              fontSize="Headline"
              style={styles.textInputField}
              containerStyle={styles.textInputContainer}
              focusBorder={false}
              accessibilityLabel="Describe your meal"
            />
            <FavoritesSection
              favorites={filteredFavorites}
              onSelectFavorite={handleCreateLogFromFavorite}
              isVisible={!(draft.localImagePath || isProcessingImage)}
            />
            <ImageSection
              imageUrl={draft.localImagePath}
              isProcessing={isProcessingImage}
              onRemoveImage={handleRemoveImage}
              isVisible={!!(draft.localImagePath || isProcessingImage)}
            />
          </View>
        )}
      </ScrollView>
      <KeyboardStickyView offset={{ closed: -30, opened: 20 }}>
        <KeyboardAccessory
          textInputRef={textInputRef}
          requestMicPermission={requestPermission}
          onRecording={startRecording}
          onStopRecording={stopRecording}
          onEstimate={handleEstimation}
          canContinue={canContinue}
          isEstimating={isEstimating}
          isRecording={isRecording}
          isTransitioning={isTransitioning}
          volumeLevel={volumeLevel}
          logId={draft.id}
        />
      </KeyboardStickyView>
    </View>
  );
}
