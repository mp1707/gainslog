import { useAppStore } from "@/store/useAppStore";
import { Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { Favorite } from "@/types/models";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState, useEffect } from "react";
import { StyleSheet, TextInput as RNTextInput, View } from "react-native";
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
import { useCreationStore } from "@/store/useCreationStore"; // ++ IMPORT the new store

const inputAccessoryViewID = "create-input-accessory";

export default function Create() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const {
    pendingLog,
    startNewLog,
    clearPendingLog,
    updatePendingLog,
  } = useCreationStore();
  const { selectedDate, addFoodLog } = useAppStore();
  const { startEstimation } = useEstimation();
  const { isRecording, liveTranscription, stopRecording, startRecording } =
    useTranscription();

  const [estimationType, setEstimationType] = useState<
    "ai" | "favorites" | "manual"
  >("ai");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const textInputRef = useRef<RNTextInput>(null);
  useDelayedAutofocus(textInputRef);

  useEffect(() => {
    startNewLog(selectedDate);
    return () => {
      clearPendingLog();
    };
  }, [startNewLog, clearPendingLog, selectedDate]);

  const handleNewImageSelected = useCallback(
    async (uri: string) => {
      setIsProcessingImage(true);
      try {
        const { localImagePath, supabaseImagePath } = await processImage(uri);
        updatePendingLog({
          localImagePath,
          supabaseImagePath,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          estimationConfidence: 0,
        });
      } catch (error) {
        console.log("Error processing image:", error);
        showErrorToast("Error processing image", "Please try again.");
      } finally {
        setIsProcessingImage(false);
      }
    },
    [updatePendingLog]
  );

  const handleTranscriptionStop = useCallback(async () => {
    if (!pendingLog) return;
    if (liveTranscription.trim()) {
      updatePendingLog({
        description:
          pendingLog.description !== ""
            ? pendingLog.description + " " + liveTranscription.trim()
            : liveTranscription.trim(),
      });
    }
    await stopRecording();
  }, [liveTranscription, stopRecording, pendingLog, updatePendingLog]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleEstimation = useCallback(() => {
    if (!pendingLog) return;
    startEstimation(pendingLog);
    router.back();
  }, [pendingLog, startEstimation, router]);

  const handleCreateLogFromFavorite = useCallback(
    (favorite: Favorite) => {
      addFoodLog({
        ...favorite,
        logDate: selectedDate,
        createdAt: new Date().toISOString(),
        isEstimating: false,
        estimationConfidence: 100,
        id: favorite.id,
      });
      router.back();
    },
    [addFoodLog, selectedDate, router]
  );

  const handleDescriptionChange = useCallback(
    (description: string) => {
      updatePendingLog({ description });
    },
    [updatePendingLog]
  );

  // ++ FIX: The early return is now placed AFTER all hook calls.
  if (!pendingLog) {
    return null;
  }

  // This constant now safely depends on pendingLog
  const canContinue =
    pendingLog.description?.trim() !== "" || !!pendingLog.localImagePath;

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
          description={pendingLog.description}
          onDescriptionChange={handleDescriptionChange}
          imageUrl={pendingLog.localImagePath}
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
            logId={pendingLog.id}
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
