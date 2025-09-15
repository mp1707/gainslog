import { useAppStore } from "@/store/useAppStore";
import { Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { Favorite } from "@/types/models";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { useTranscription } from "@/hooks/useTranscription";
import { useEstimation } from "@/hooks/useEstimation";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { TranscriptionOverlay } from "@/components/shared/TranscriptionOverlay";
import { CreateHeader } from "@/components/create-page/CreateHeader/CreateHeader";
import { EstimationTab } from "@/components/create-page/EstimationTab/EstimationTab";
import { FavoritesTab } from "@/components/create-page/FavoritesTab/FavoritesTab";
import { KeyboardAccessory } from "@/components/create-page/KeyboardAccessory/KeyboardAccessory";
import { Toggle } from "@/components/shared/Toggle";
import { showErrorToast } from "@/lib/toast";
import { processImage } from "@/utils/processImage";
import { useCreationStore } from "@/store/useCreationStore"; // keyed drafts store
import { useDraft } from "@/hooks/useDraft";
import { generateFoodLogId } from "@/utils/idGenerator";

const inputAccessoryViewID = "create-input-accessory";

export default function Create() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { startNewDraft, clearDraft, updateDraft } = useCreationStore();
  const [draftId, setDraftId] = useState<string | null>(null);
  const draft = useDraft(draftId);
  const { selectedDate, addFoodLog } = useAppStore();
  const { runEstimation } = useEstimation();
  const { isRecording, liveTranscription, stopRecording, startRecording } =
    useTranscription();

  const [estimationType, setEstimationType] = useState<
    "ai" | "favorites" | "manual"
  >("ai");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
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
      try {
        const { localImagePath, supabaseImagePath } = await processImage(uri);
        updateDraft(draftId, {
          localImagePath,
          supabaseImagePath,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          estimationConfidence: 0,
        });
      } catch (error) {
        showErrorToast("Error processing image", "Please try again.");
      } finally {
        setIsProcessingImage(false);
      }
    },
    [draftId, updateDraft]
  );

  const handleTranscriptionStop = useCallback(async () => {
    if (!draft) return;
    if (liveTranscription.trim()) {
      updateDraft(draft.id, {
        description:
          draft.description !== ""
            ? draft.description + " " + liveTranscription.trim()
            : liveTranscription.trim(),
      });
    }
    await stopRecording();
  }, [liveTranscription, stopRecording, draft, updateDraft]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleEstimation = useCallback(() => {
    if (!draft) return;
    runEstimation(draft);
    router.back();
  }, [draft, runEstimation, router]);

  const handleCreateLogFromFavorite = useCallback(
    (favorite: Favorite) => {
      addFoodLog({
        ...favorite,
        logDate: selectedDate,
        createdAt: new Date().toISOString(),
        isEstimating: false,
        estimationConfidence: 100,
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

  // Render a lightweight loading state instead of returning null to avoid white flash
  if (!draft) {
    return (
      <GradientWrapper style={styles.container}>
        <CreateHeader onCancel={handleCancel} />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      </GradientWrapper>
    );
  }

  // This constant now safely depends on pendingLog
  const canContinue =
    draft.description?.trim() !== "" || !!draft.localImagePath;

  return (
    <GradientWrapper style={styles.container}>
      <CreateHeader onCancel={handleCancel} />
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
      {estimationType === "ai" && (
        <EstimationTab
          description={draft.description}
          onDescriptionChange={handleDescriptionChange}
          imageUrl={draft.localImagePath}
          isUploadingImage={isProcessingImage}
          textInputRef={textInputRef}
          inputAccessoryViewID={inputAccessoryViewID}
        />
      )}
      {estimationType === "favorites" && (
        <FavoritesTab onCreateFromFavorite={handleCreateLogFromFavorite} />
      )}
      {estimationType === "ai" && (
        <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
          <KeyboardAccessory
            onImageSelected={handleNewImageSelected}
            textInputRef={textInputRef}
            onRecording={startRecording}
            onEstimate={handleEstimation}
            estimateLabel={"Estimate"}
            canContinue={canContinue}
            logId={draft.id}
          />
        </KeyboardStickyView>
      )}
      <TranscriptionOverlay
        visible={isRecording}
        onStop={handleTranscriptionStop}
      />
    </GradientWrapper>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.md,
    },
    toggleContainer: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
  });
