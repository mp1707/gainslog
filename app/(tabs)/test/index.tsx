"use client";

import React from "react";
import { ScrollView, StyleSheet, View, ActivityIndicator } from "react-native";
import { DateTimePicker, Host } from "@expo/ui/swift-ui";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/theme/ThemeProvider";
import { Theme } from "@/theme/theme";
import { Favorite } from "@/types/models";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { TextInput as RNTextInput } from "react-native";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { useTranscription } from "@/hooks/useTranscription";
import { useEstimation } from "@/hooks/useEstimation";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { EstimationTab } from "@/components/create-page/EstimationTab/EstimationTab";
import { FavoritesTab } from "@/components/create-page/FavoritesTab/FavoritesTab";
import { KeyboardAccessory } from "@/components/create-page/KeyboardAccessory/KeyboardAccessory";
import { Toggle } from "@/components/shared/Toggle";
import { showErrorToast } from "@/lib/toast";
import { processImage } from "@/utils/processImage";
import { useCreationStore } from "@/store/useCreationStore";
import { useDraft } from "@/hooks/useDraft";
import { generateFoodLogId } from "@/utils/idGenerator";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { InlinePaywallCard } from "@/components/paywall/InlinePaywallCard";
import { BrainCircuit } from "lucide-react-native";

const inputAccessoryViewID = "create-input-accessory";

export default function CreateTabScreen() {
  const { theme, colors } = useTheme();
  const styles = createStyles(theme);
  const router = useSafeRouter();
  const { selectedDate, setSelectedDate } = useAppStore();
  const { startNewDraft, clearDraft, updateDraft } = useCreationStore();
  const [draftId, setDraftId] = useState<string | null>(null);
  const draft = useDraft(draftId);
  const { addFoodLog } = useAppStore();
  const isPro = useAppStore((state) => state.isPro);
  const isVerifyingSubscription = useAppStore(
    (state) => state.isVerifyingSubscription
  );
  const { runCreateEstimation } = useEstimation();
  const {
    requestPermission,
    isRecording,
    liveTranscription,
    volumeLevel,
    stopRecording,
    startRecording,
  } = useTranscription();
  const baseDescriptionRef = useRef<string | null>(null);

  const [estimationType, setEstimationType] = useState<
    "ai" | "favorites" | "manual"
  >("ai");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const textInputRef = useRef<RNTextInput>(null);
  useDelayedAutofocus(textInputRef);

  useEffect(() => {
    const id = startNewDraft(selectedDate);
    setDraftId(id);
    return () => {
      clearDraft(id);
    };
  }, [startNewDraft, clearDraft, selectedDate]);

  const handleNewImageSelected = useCallback(
    async (uri: string) => {
      if (!draftId) return;
      setIsProcessingImage(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      try {
        const { localImagePath, supabaseImagePath } = await processImage(uri);
        updateDraft(draftId, {
          localImagePath,
          supabaseImagePath,
          pendingImageUri: undefined,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        });
      } catch (error) {
        showErrorToast("Error processing image", "Please try again.");
      } finally {
        setIsProcessingImage(false);
      }
    },
    [draftId, updateDraft]
  );

  // Watch for pending image URI from camera and process it
  useEffect(() => {
    if (draft?.pendingImageUri) {
      handleNewImageSelected(draft.pendingImageUri);
    }
  }, [draft?.pendingImageUri, handleNewImageSelected]);

  // Capture the base description when recording starts
  useEffect(() => {
    if (isRecording) {
      baseDescriptionRef.current = draft?.description ?? "";
    }
  }, [isRecording]);

  // While recording, reflect interim transcription directly in the input
  useEffect(() => {
    if (!draft || !isRecording) return;
    const base = (baseDescriptionRef.current || "").trim();
    const interim = liveTranscription.trim();
    const merged = [base, interim].filter(Boolean).join(" ");

    if ((draft.description ?? "") !== merged) {
      updateDraft(draft.id, { description: merged });
    }
  }, [
    draft?.id,
    draft?.description,
    isRecording,
    liveTranscription,
    updateDraft,
  ]);

  const handleTranscriptionStop = useCallback(async () => {
    await stopRecording();
  }, [stopRecording]);

  const handleCancel = useCallback(() => {
    router.back();
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
    setIsEstimating(true);
    runCreateEstimation(draft);
    router.back();
  }, [
    draft,
    isPro,
    isEstimating,
    runCreateEstimation,
    router,
    handleShowPaywall,
  ]);

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

  const handleDescriptionChange = useCallback(
    (description: string) => {
      if (!draftId) return;
      updateDraft(draftId, { description });
    },
    [draftId, updateDraft]
  );

  const handleDateSelected = useCallback(
    (date: Date) => {
      // Convert Date object to YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      setSelectedDate(formattedDate);
    },
    [setSelectedDate]
  );

  // Render a lightweight loading state instead of returning null to avoid white flash
  if (!draft) {
    return (
      <GradientWrapper style={styles.container}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      </GradientWrapper>
    );
  }

  const canContinue =
    (draft.description?.trim() !== "" || !!draft.localImagePath) &&
    !isEstimating;

  return (
    <GradientWrapper style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.datePickerContainer}>
          <Host matchContents>
            <DateTimePicker
              onDateSelected={handleDateSelected}
              displayedComponents="date"
              initialDate={selectedDate}
              variant="compact"
              color={colors.accent}
            />
          </Host>
        </View>

        <View style={styles.toggleContainer}>
          <Toggle
            value={estimationType}
            options={[
              { label: "Estimation", value: "ai" },
              { label: "Favorites", value: "favorites" },
              { label: "Manual", value: "manual" },
            ]}
            onChange={setEstimationType}
          />
        </View>

        {estimationType === "ai" &&
          (isVerifyingSubscription ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator />
            </View>
          ) : isPro ? (
            <EstimationTab
              description={draft.description}
              onDescriptionChange={handleDescriptionChange}
              imageUrl={draft.localImagePath}
              isUploadingImage={isProcessingImage}
              textInputRef={textInputRef}
              inputAccessoryViewID={inputAccessoryViewID}
            />
          ) : (
            <View style={styles.lockedContainer}>
              <InlinePaywallCard
                Icon={BrainCircuit}
                title="AI Logging is a Pro Feature"
                body="Log meals effortlessly with a photo, text, or your voice."
                ctaLabel="Start Free Trial"
                onPress={handleShowPaywall}
                testID="create-inline-paywall"
              />
            </View>
          ))}

        {estimationType === "favorites" && (
          <FavoritesTab onCreateFromFavorite={handleCreateLogFromFavorite} />
        )}
      </ScrollView>

      {estimationType === "ai" && isPro && !isVerifyingSubscription && (
        <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
          <KeyboardAccessory
            onImageSelected={handleNewImageSelected}
            textInputRef={textInputRef}
            requestMicPermission={requestPermission}
            onRecording={startRecording}
            onStop={handleTranscriptionStop}
            isRecording={isRecording}
            volumeLevel={volumeLevel}
            onEstimate={handleEstimation}
            estimateLabel={"Estimate"}
            canContinue={canContinue}
            isEstimating={isEstimating}
            logId={draft.id}
          />
        </KeyboardStickyView>
      )}
    </GradientWrapper>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.md,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
    datePickerContainer: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    toggleContainer: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    lockedContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
  });
