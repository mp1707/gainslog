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
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { showErrorToast } from "@/lib/toast";
import { uploadToSupabaseStorage } from "@/utils/uploadToSupabaseStorage";

const inputAccessoryViewID = "create-input-accessory";

export default function Create() {
  const { theme } = useTheme();
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
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const textInputRef = useRef<RNTextInput>(null);
  const { back } = useRouter();
  useDelayedAutofocus(textInputRef);

  const handleNewImageSelected = useCallback(async (uri: string) => {
    setIsProcessingImage(true);
    try {
      // Resize the image to a max width of 1000px, maintaining aspect ratio.
      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const uniqueFilename = `${uuidv4()}.jpg`;
      // Define the permanent path in the app's sandboxed document directory.
      const permanentPath = `${FileSystem.documentDirectory}${uniqueFilename}`;

      // Move the resized image from its temporary cache location to the permanent path.
      await FileSystem.moveAsync({
        from: resizedImage.uri,
        to: permanentPath,
      });

      const supabaseImagePath = await uploadToSupabaseStorage(permanentPath);

      console.log("Image saved locally to:", permanentPath);

      setNewLog((prev) => ({
        ...prev,
        localImagePath: permanentPath,
        supabaseImagePath,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        estimationConfidence: 0,
      }));
    } catch (error) {
      console.log("Error processing image:", error);
      showErrorToast("Error processing image", "Please try again.");
    } finally {
      setIsProcessingImage(false);
    }
  }, []);

  const canContinue =
    newLog?.description?.trim() !== "" || newLog.localImagePath !== "";

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

  useEffect(() => {
    setImageCallback(handleNewImageSelected);

    return () => {
      setImageCallback(undefined);
    };
  }, [handleNewImageSelected, setImageCallback]);

  useEffect(() => {
    setNewLog((prev) => ({
      // Ensure state updates are based on previous state
      ...prev,
      logDate: selectedDate,
    }));
  }, [selectedDate]);

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
