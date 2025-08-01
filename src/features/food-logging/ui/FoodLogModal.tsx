import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { FormField, NutritionGrid, ImageSkeleton, DescriptionSkeleton, InlineRecordButton } from '@/shared/ui';
import { FoodLog, ModalMode } from '../../../types';
import { mergeNutritionData } from '../utils';
import { useFoodLogStore } from '../../../stores/useFoodLogStore';
import { useStyles } from './FoodLogModal.styles';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { AudioModule } from 'expo-audio';

type RecordingState = 'recording' | 'idle';

interface FoodLogModalProps {
  visible: boolean;
  mode: ModalMode;
  selectedLog: FoodLog | null;
  onClose: () => void;
  onSave: (log: FoodLog) => void;
  isAudioMode?: boolean;
}

export const FoodLogModal: React.FC<FoodLogModalProps> = ({
  visible,
  mode,
  selectedLog,
  onClose,
  onSave,
  isAudioMode = false,
}) => {
  const styles = useStyles();
  const { selectedDate, foodLogs } = useFoodLogStore();
  
  // Get the live log from store to reflect upload progress
  const currentLog = selectedLog ? foodLogs.find(log => log.id === selectedLog.id) || selectedLog : selectedLog;
  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [tempCalories, setTempCalories] = useState('');
  const [tempProtein, setTempProtein] = useState('');
  const [tempCarbs, setTempCarbs] = useState('');
  const [tempFat, setTempFat] = useState('');
  const [validationError, setValidationError] = useState('');

  // Audio recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [liveTranscription, setLiveTranscription] = useState('');
  const isRecording = useRef(false);
  const baseDescriptionRef = useRef(''); // Track base description before recording

  // Speech recognition event handlers
  useSpeechRecognitionEvent('result', (event) => {
    if (!isRecording.current) return;

    if (event.results && event.results.length > 0) {
      // Get the latest transcription result
      const latestResult = event.results[event.results.length - 1];
      const transcription = latestResult.transcript.trim();
      
      if (transcription) {
        // Always show live transcription feedback
        setLiveTranscription(transcription);
        
        // Display in description field for live feedback
        // This shows the base text + current transcription being spoken
        const displayText = baseDescriptionRef.current.trim() 
          ? `${baseDescriptionRef.current} ${transcription}`
          : transcription;
        setTempDescription(displayText);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (!isRecording.current) return;

    console.error('Speech recognition error:', event.error);
    handleStopRecording();
    
    let errorMessage = 'Voice recognition failed. Please try again.';
    if (event.error === 'no-speech') {
      errorMessage = 'No speech detected. Please speak clearly and try again.';
    } else if (event.error === 'network') {
      errorMessage = 'Network connection required for voice recognition.';
    }
    
    Alert.alert('Voice Recognition Error', errorMessage);
  });

  useSpeechRecognitionEvent('end', () => {
    if (isRecording.current) {
      // When recognition ends, save the current transcription as final
      if (liveTranscription.trim()) {
        const finalText = baseDescriptionRef.current.trim() 
          ? `${baseDescriptionRef.current} ${liveTranscription.trim()}`
          : liveTranscription.trim();
        
        // Update the base description with final results
        baseDescriptionRef.current = finalText;
        setTempDescription(finalText);
      }
      handleStopRecording();
    }
  });

  // Auto-start recording when modal opens in audio mode
  useEffect(() => {
    if (visible && isAudioMode) {
      // Set base description to current value when starting audio mode
      baseDescriptionRef.current = tempDescription;
      startRecording();
    } else if (!visible) {
      // Clean up when modal closes
      if (isRecording.current) {
        handleStopRecording();
      }
      setRecordingState('idle');
      setLiveTranscription('');
      baseDescriptionRef.current = '';
    }
  }, [visible, isAudioMode]);

  // Reset form when modal opens or when currentLog changes (e.g., transcription completes)
  useEffect(() => {
    if (visible && currentLog) {
      // For audio logs being transcribed, keep title field empty for user input
      // For other logs, use generatedTitle as fallback
      const titleValue = currentLog.userTitle || 
        (currentLog.isTranscribing ? '' : currentLog.generatedTitle) || '';
      
      setTempTitle(titleValue);
      setTempDescription(currentLog.userDescription || '');
      setTempCalories(currentLog.userCalories?.toString() || '');
      setTempProtein(currentLog.userProtein?.toString() || '');
      setTempCarbs(currentLog.userCarbs?.toString() || '');
      setTempFat(currentLog.userFat?.toString() || '');
      setValidationError(''); // Clear error when form resets
    } else if (visible && mode === 'create') {
      setTempTitle('');
      setTempDescription('');
      setTempCalories('');
      setTempProtein('');
      setTempCarbs('');
      setTempFat('');
      setValidationError(''); // Clear error when form resets
      // Reset audio recording state for fresh create logs
      baseDescriptionRef.current = '';
    } else if (!visible) {
      // Clear error when modal closes
      setValidationError('');
    }
  }, [visible, currentLog, mode]);

  // Audio recording functions
  const startRecording = async () => {
    try {
      setRecordingState('recording');
      setLiveTranscription('');

      // Request microphone permission
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow microphone access to use voice recording.',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      }

      // Request speech recognition permission
      const speechPermission = await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
      if (!speechPermission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow speech recognition access for voice transcription.',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      }

      // Start real-time speech recognition
      await ExpoSpeechRecognitionModule.start({
        lang: 'de-DE', // Could be made configurable
        interimResults: true, // Enable for live feedback
        maxAlternatives: 1,
        continuous: true,
      });

      isRecording.current = true;
      setRecordingState('recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
      setRecordingState('idle');
    }
  };

  const handleStopRecording = async () => {
    try {
      if (isRecording.current) {
        // Before stopping, capture any current transcription as final
        if (liveTranscription.trim()) {
          const finalText = baseDescriptionRef.current.trim() 
            ? `${baseDescriptionRef.current} ${liveTranscription.trim()}`
            : liveTranscription.trim();
          
          // Update the base description and display
          baseDescriptionRef.current = finalText;
          setTempDescription(finalText);
        }
        
        await ExpoSpeechRecognitionModule.stop();
        isRecording.current = false;
      }
      setRecordingState('idle');
      setLiveTranscription('');
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const startNewRecording = async () => {
    // For the inline record button - append to existing description
    if (recordingState === 'recording') {
      handleStopRecording();
    } else {
      // Set base description to current value when starting new recording
      baseDescriptionRef.current = tempDescription;
      await startRecording();
    }
  };

  const handleSave = () => {
    // Validate required fields for create mode - either title OR description needed for non-image logs
    const isImageLog = currentLog?.imageUrl || currentLog?.localImageUri;
    if (mode === 'create' && !isImageLog && !tempTitle.trim() && !tempDescription.trim()) {
      setValidationError('Please provide either a title or description for your food log.');
      return;
    }

    // Clear any existing validation error
    setValidationError('');

    // Get nutrition data from user input and determine if AI estimation is needed
    const nutritionData = mergeNutritionData(tempCalories, tempProtein, tempCarbs, tempFat);

    // Validate nutrition input
    if (!nutritionData.isValid) {
      Alert.alert('Validation Error', nutritionData.validationErrors.join('\n'));
      return;
    }

    let finalLog: FoodLog;

    if (mode === 'edit' && currentLog) {
      // Updating existing log - preserve original ID and metadata
      finalLog = {
        ...currentLog,
        userTitle: tempTitle.trim() || undefined,
        userDescription: tempDescription.trim() || undefined,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        userCalories: nutritionData.userCalories,
        userProtein: nutritionData.userProtein,
        userCarbs: nutritionData.userCarbs,
        userFat: nutritionData.userFat,
        needsAiEstimation: nutritionData.needsAiEstimation,
        // Reset confidence to trigger re-estimation
        estimationConfidence: nutritionData.needsAiEstimation ? 0 : 100,
      };
    } else if (mode === 'create' && currentLog) {
      // Processing existing log (image log) - return log with user input for AI processing
      finalLog = {
        ...currentLog,
        userTitle: tempTitle.trim() || undefined,
        userDescription: tempDescription.trim() || undefined,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        userCalories: nutritionData.userCalories,
        userProtein: nutritionData.userProtein,
        userCarbs: nutritionData.userCarbs,
        userFat: nutritionData.userFat,
        needsAiEstimation: nutritionData.needsAiEstimation,
      };
    } else {
      // Creating completely new log (manual entry) using selected date
      const newId = `food_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      finalLog = {
        id: newId,
        generatedTitle: tempTitle.trim() || 'Manual entry',
        estimationConfidence: nutritionData.needsAiEstimation ? 0 : 100,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fat: nutritionData.fat,
        userTitle: tempTitle.trim() || undefined,
        userDescription: tempDescription.trim() || undefined,
        userCalories: nutritionData.userCalories,
        userProtein: nutritionData.userProtein,
        userCarbs: nutritionData.userCarbs,
        userFat: nutritionData.userFat,
        createdAt: new Date().toISOString(),
        date: selectedDate,
        needsAiEstimation: nutritionData.needsAiEstimation,
      };
    }

    // Close modal immediately and let parent handle AI processing
    onSave(finalLog);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {mode === 'create' ? 'Add Food Log' : 'Add Info'}
          </Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={currentLog?.isUploading}
          >
            <Text style={[
              styles.saveButton,
              currentLog?.isUploading && styles.saveButtonDisabled
            ]}>
              {currentLog?.isUploading ? 'Uploading...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {validationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{validationError}</Text>
          </View>
        )}

        <KeyboardAwareScrollView 
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1 }}
          bottomOffset={20}
          showsVerticalScrollIndicator={false}
        >
          {(currentLog?.imageUrl || currentLog?.localImageUri) && (
            <View style={styles.imageContainer}>
              {currentLog.isUploading ? (
                <ImageSkeleton 
                  width="100%" 
                  height={200}
                  style={styles.foodImage}
                />
              ) : (
                <Image 
                  source={{ uri: currentLog.imageUrl || currentLog.localImageUri }} 
                  style={styles.foodImage}
                  resizeMode="cover"
                />
              )}
            </View>
          )}

          <FormField
            label="Title"
            value={tempTitle}
            onChangeText={(text) => {
              setTempTitle(text);
              if (validationError) setValidationError(''); // Clear error when user types
            }}
            placeholder={(currentLog?.imageUrl || currentLog?.localImageUri) ? 'Enter food title (AI will generate if empty)' : 'Enter food title'}
            readOnly={recordingState === 'recording'}
          />

          {currentLog?.isTranscribing ? (
            <DescriptionSkeleton label="Description" />
          ) : (
            <FormField
              label="Description"
              value={tempDescription}
              onChangeText={(text) => {
                setTempDescription(text);
                if (validationError) setValidationError(''); // Clear error when user types
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

          <NutritionGrid
            calories={tempCalories}
            protein={tempProtein}
            carbs={tempCarbs}
            fat={tempFat}
            onCaloriesChange={setTempCalories}
            onProteinChange={setTempProtein}
            onCarbsChange={setTempCarbs}
            onFatChange={setTempFat}
            disabled={recordingState === 'recording'}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </Modal>
  );
};