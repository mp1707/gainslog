import React from 'react';
import { SparkleIcon, PencilIcon } from 'phosphor-react-native';
import { FormField, NutritionGrid, DescriptionSkeleton, InlineRecordButton } from '@/shared/ui';
import { Toggle, type ToggleOption } from '@/shared/ui/atoms/Toggle';
import { FoodLog } from '@/types';
import { FoodLogFormData } from '../../hooks/useFoodLogForm';
import { UseAudioRecordingReturn } from '../../hooks/useAudioRecording';
import { NutritionMode } from '../../FoodLogModal';

interface FoodLogFormFieldsProps {
  formData: FoodLogFormData;
  currentLog: FoodLog | null;
  audioRecording: UseAudioRecordingReturn;
  nutritionMode: NutritionMode;
  onFieldChange: (field: keyof FoodLogFormData, value: string) => void;
  onValidationErrorClear: () => void;
  onNutritionModeChange: (mode: NutritionMode) => void;
}

export const FoodLogFormFields: React.FC<FoodLogFormFieldsProps> = ({
  formData,
  currentLog,
  audioRecording,
  nutritionMode,
  onFieldChange,
  onValidationErrorClear,
  onNutritionModeChange,
}) => {
  const { recordingState, startNewRecording, handleStopRecording, getCurrentTranscription } = audioRecording;

  // Use live transcription from audio hook for description field during recording
  const displayDescription = recordingState === 'recording' 
    ? getCurrentTranscription() 
    : formData.description;

  // Nutrition mode toggle options
  const nutritionModeOptions: [ToggleOption<NutritionMode>, ToggleOption<NutritionMode>] = [
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
    <>
      <FormField
        label="Title"
        value={formData.title}
        onChangeText={(text) => {
          onFieldChange('title', text);
          onValidationErrorClear();
        }}
        placeholder={(currentLog?.imageUrl || currentLog?.localImageUri) ? 'Enter food title (AI will generate if empty)' : 'Enter food title'}
        readOnly={recordingState === 'recording'}
      />

      {currentLog?.isTranscribing ? (
        <DescriptionSkeleton label="Description" />
      ) : (
        <FormField
          label="Description"
          value={displayDescription}
          onChangeText={(text) => {
            onFieldChange('description', text);
            onValidationErrorClear();
          }}
          placeholder="Add details about preparation, ingredients, portion size, etc."
          multiline={true}
          readOnly={recordingState === 'recording'}
        >
          {recordingState === 'idle' && (
            <InlineRecordButton 
              onPress={startNewRecording}
              isRecording={false}
            />
          )}
          {recordingState === 'recording' && (
            <InlineRecordButton 
              onPress={handleStopRecording}
              isRecording={true}
            />
          )}
        </FormField>
      )}

      {/* Nutrition mode toggle */}
      <Toggle
        value={nutritionMode}
        options={nutritionModeOptions}
        onChange={onNutritionModeChange}
        accessibilityLabel="Select nutrition input mode"
      />

      {/* Show nutrition inputs only in manual mode */}
      {nutritionMode === "manual" && (
        <NutritionGrid
          calories={formData.calories}
          protein={formData.protein}
          carbs={formData.carbs}
          fat={formData.fat}
          onCaloriesChange={(value) => onFieldChange('calories', value)}
          onProteinChange={(value) => onFieldChange('protein', value)}
          onCarbsChange={(value) => onFieldChange('carbs', value)}
          onFatChange={(value) => onFieldChange('fat', value)}
          disabled={recordingState === 'recording'}
        />
      )}
    </>
  );
};