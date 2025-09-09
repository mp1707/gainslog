import { useAppStore } from "@/store/useAppStore";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { Favorite, FoodLog } from "@/types/models";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { StyleSheet, TextInput as RNTextInput, View } from "react-native";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { useTranscription } from "@/hooks/useTranscription";
import { useImageSelection } from "@/hooks/useImageSelection";
import { useEstimation } from "@/hooks/useEstimation";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { generateFoodLogId } from "@/utils/idGenerator";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { TranscriptionOverlay } from "@/components/shared/TranscriptionOverlay";
import { CreateHeader } from "@/components/create-page/CreateHeader/CreateHeader";
import { EstimationTab } from "@/components/create-page/EstimationTab/EstimationTab";
import { FavoritesTab } from "@/components/create-page/FavoritesTab/FavoritesTab";
import { KeyboardAccessory } from "@/components/create-page/KeyboardAccessory/KeyboardAccessory";
import { Toggle } from "@/components/shared/Toggle";
import { uploadToSupabaseStorage } from "@/utils/uploadToSupabaseStorage";

const inputAccessoryViewID = "create-input-accessory";

export default function Create() {
  const { colors, theme } = useTheme();
  const [estimationType, setEstimationType] = useState<
    "ai" | "favorites" | "manual"
  >("ai");
  const { selectedDate, addFoodLog, setImageCallback } = useAppStore();
  const { startEstimation } = useEstimation();
  const [newLog, setNewLog] = useState<FoodLog>({
    id: "",
    title: "",
    description: "",
    supabaseImagePath: "",
    localImagePath: "",
    logDate: selectedDate,
    createdAt: new Date().toISOString(),
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    estimationConfidence: 0,
  });

  const styles = createStyles(theme);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const textInputRef = useRef<RNTextInput>(null);
  const estimateLabel = useMemo(() => {
    if (newLog.estimationConfidence && newLog.estimationConfidence > 0)
      return "Re-estimate";
    return "Estimate";
  }, [newLog.estimationConfidence]);

  useDelayedAutofocus(textInputRef);

  useEffect(() => {
    setNewLog({
      ...newLog,
      logDate: selectedDate,
    });
  }, [selectedDate]);

  const handleImageSelected = useCallback(async (uri: string) => {
    setIsUploadingImage(true);
    try {
      const uploadedImageUrl = await uploadToSupabaseStorage(uri);
      setNewLog((prev) => ({
        ...prev,
        localImagePath: uri,
        supabaseImagePath: uploadedImageUrl,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        estimationConfidence: 0,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  useEffect(() => {
    setImageCallback(handleImageSelected);

    return () => {
      setImageCallback(undefined);
    };
  }, [handleImageSelected, setImageCallback]);

  const canContine =
    newLog?.description?.trim() !== "" || newLog.supabaseImagePath !== "";

  const { isRecording, liveTranscription, stopRecording, startRecording } =
    useTranscription();

  const handleTranscriptionStop = useCallback(async () => {
    if (liveTranscription.trim()) {
      setNewLog((prev) => ({
        ...prev,
        description:
          prev.description !== ""
            ? prev.description + " " + liveTranscription.trim()
            : liveTranscription.trim(),
      }));
    }
    await stopRecording();
  }, [liveTranscription, stopRecording]);

  const { back } = useRouter();
  const handleCancel = useCallback(() => {
    back();
  }, [back]);

  const handleEstimation = useCallback(() => {
    startEstimation({
      logDate: newLog.logDate,
      createdAt: newLog.createdAt,
      title: newLog.title,
      description: newLog.description,
      supabaseImagePath: newLog.supabaseImagePath,
      localImagePath: newLog.localImagePath,
    });
    back();
  }, [newLog, startEstimation, back]);

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
      back();
    },
    [addFoodLog, selectedDate, back]
  );

  const handleDescriptionChange = useCallback((description: string) => {
    setNewLog((prev) => ({ ...prev, description }));
  }, []);

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
          description={newLog.description}
          onDescriptionChange={handleDescriptionChange}
          imageUrl={newLog.localImagePath}
          isUploadingImage={isUploadingImage}
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
            onImageSelected={handleImageSelected}
            textInputRef={textInputRef}
            onRecording={startRecording}
            onEstimate={handleEstimation}
            estimateLabel={estimateLabel}
            canContinue={canContine}
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
