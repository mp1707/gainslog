import React, { useRef, useEffect } from "react";
import { SparkleIcon, PencilIcon } from "phosphor-react-native";
import {
  FormField,
  NutritionGrid,
  DescriptionSkeleton,
  InlineRecordButton,
} from "@/shared/ui";
import { Toggle, type ToggleOption } from "@/shared/ui/atoms/Toggle";
import { FoodLog } from "@/types";
import { FoodLogFormData } from "../../hooks/useFoodLogForm";
import { UseAudioRecordingReturn } from "../../hooks/useAudioRecording";
import { NutritionMode } from "../../FoodLogModal";
import { View, Keyboard } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  SlideInLeft,
  SlideOutLeft,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import { useStyles } from "./FoodLogFormFields.styles";
import { AppText } from "@/components";

interface FoodLogFormFieldsProps {
  formData: FoodLogFormData;
  currentLog: FoodLog | null;
  audioRecording: UseAudioRecordingReturn;
  nutritionMode: NutritionMode;
  onFieldChange: (field: keyof FoodLogFormData, value: string) => void;
  onValidationErrorClear: () => void;
  onNutritionModeChange: (mode: NutritionMode) => void;
  titleInputRef?: any;
}

export const FoodLogFormFields: React.FC<FoodLogFormFieldsProps> = ({
  formData,
  currentLog,
  audioRecording,
  nutritionMode,
  onFieldChange,
  onValidationErrorClear,
  onNutritionModeChange,
  titleInputRef,
}) => {
  const {
    recordingState,
    startNewRecording,
    handleStopRecording,
    getCurrentTranscription,
  } = audioRecording;
  const styles = useStyles();
  const internalTitleRef = useRef<any>(null);
  const effectiveTitleRef = titleInputRef || internalTitleRef;

  // Use live transcription from audio hook for description field during recording
  const displayDescription =
    recordingState === "recording"
      ? getCurrentTranscription()
      : formData.description;

  // Nutrition mode toggle options
  const nutritionModeOptions: [
    ToggleOption<NutritionMode>,
    ToggleOption<NutritionMode>
  ] = [
    {
      value: "estimation",
      label: "Estimation",
      icon: SparkleIcon,
    },
    {
      value: "manual",
      label: "Manual",
      icon: PencilIcon,
    },
  ];

  return (
    <View style={styles.container}>
      <FormField
        label="Title"
        value={formData.title}
        inputRef={effectiveTitleRef}
        autoFocus={recordingState !== "recording"}
        onChangeText={(text) => {
          onFieldChange("title", text);
          onValidationErrorClear();
        }}
        placeholder={
          currentLog?.imageUrl || currentLog?.localImageUri
            ? "Enter food title (AI will generate if empty)"
            : "Enter food title"
        }
        readOnly={recordingState === "recording"}
      />

      {currentLog?.isTranscribing ? (
        <DescriptionSkeleton label="Description" />
      ) : (
        <FormField
          label="Description"
          value={displayDescription}
          onChangeText={(text) => {
            onFieldChange("description", text);
            onValidationErrorClear();
          }}
          placeholder="Add details about preparation, ingredients, portion size, etc."
          multiline={true}
          readOnly={recordingState === "recording"}
        >
          {recordingState === "idle" && (
            <InlineRecordButton
              onPress={startNewRecording}
              isRecording={false}
            />
          )}
          {recordingState === "recording" && (
            <InlineRecordButton
              onPress={handleStopRecording}
              isRecording={true}
            />
          )}
        </FormField>
      )}

      <AppText role="Headline">Nutrition (Optional)</AppText>

      {/* Nutrition mode toggle */}
      <Toggle
        value={nutritionMode}
        options={nutritionModeOptions}
        onChange={(mode) => {
          // Close keyboard so expanded content is visible
          effectiveTitleRef.current?.blur?.();
          Keyboard.dismiss();
          onNutritionModeChange(mode);
        }}
        accessibilityLabel="Select nutrition input mode"
      />

      {/* Show nutrition inputs only in manual mode with subtle enter/exit animation */}
      <Animated.View layout={LinearTransition.duration(220)}>
        {nutritionMode === "manual" ? (
          <Animated.View
            key="manual"
            entering={SlideInLeft.duration(220)}
            exiting={SlideOutLeft.duration(150)}
          >
            <Animated.View
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(150)}
            >
              <NutritionGrid
                calories={formData.calories}
                protein={formData.protein}
                carbs={formData.carbs}
                fat={formData.fat}
                onCaloriesChange={(value) => onFieldChange("calories", value)}
                onProteinChange={(value) => onFieldChange("protein", value)}
                onCarbsChange={(value) => onFieldChange("carbs", value)}
                onFatChange={(value) => onFieldChange("fat", value)}
                disabled={recordingState === "recording"}
              />
            </Animated.View>
          </Animated.View>
        ) : (
          <Animated.View
            key="estimation"
            entering={SlideInRight.duration(220)}
            exiting={SlideOutRight.duration(150)}
          >
            <Animated.View
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(150)}
            >
              <AppText role="Body" color="secondary">
                Let AI estimate all nutrition values for you.
              </AppText>
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};
