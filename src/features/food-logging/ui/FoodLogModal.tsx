import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { FormField, NutritionGrid, ImageSkeleton, DescriptionSkeleton, FloatingStopButton, InlineRecordButton } from '@/shared/ui';
import { FoodLog, ModalMode } from '../../../types';
import { mergeNutritionData } from '../utils';
import { useFoodLogStore } from '../../../stores/useFoodLogStore';
import { useStyles } from './FoodLogModal.styles';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { AudioModule } from 'expo-audio';

// Helper function to convert Date to local date string (YYYY-MM-DD)
const dateToLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type RecordingState = 'preparing' | 'recording' | 'idle';

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

  // Audio recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [liveTranscription, setLiveTranscription] = useState('');
  const isRecording = useRef(false);

  // Speech recognition event handlers
  useSpeechRecognitionEvent('result', (event) => {
    if (!isRecording.current) return;

    if (event.results && event.results.length > 0) {
      const transcription = event.results
        .map((result) => result.transcript)
        .join(' ')
        .trim();

      if (transcription) {
        setLiveTranscription(transcription);
        // Update description field with live transcription
        setTempDescription(prev => {
          // If there's existing text, append with space, otherwise replace
          return prev.trim() ? `${prev} ${transcription}` : transcription;
        });
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
      handleStopRecording();
    }
  });

  // Auto-start recording when modal opens in audio mode
  useEffect(() => {
    if (visible && isAudioMode) {
      startRecording();
    } else if (!visible) {
      // Clean up when modal closes
      if (isRecording.current) {
        handleStopRecording();
      }
      setRecordingState('idle');
      setLiveTranscription('');
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
    } else if (visible && mode === 'create') {
      setTempTitle('');
      setTempDescription('');
      setTempCalories('');
      setTempProtein('');
      setTempCarbs('');
      setTempFat('');
    }
  }, [visible, currentLog, mode]);

  // Audio recording functions
  const startRecording = async () => {
    try {
      setRecordingState('preparing');
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
        interimResults: true,
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
      await startRecording();
    }
  };

  const handleSave = () => {
    // Validate required fields for create mode - title is optional for image logs
    const isImageLog = currentLog?.imageUrl || currentLog?.localImageUri;
    if (mode === 'create' && !isImageLog && !tempTitle.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

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
          <TouchableOpacity 
            onPress={onClose}
            disabled={recordingState === 'recording'}
          >
            <Text style={[
              styles.cancelButton,
              recordingState === 'recording' && styles.saveButtonDisabled
            ]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {recordingState === 'recording' ? 'Recording...' : 
             recordingState === 'preparing' ? 'Preparing...' :
             mode === 'create' ? 'Add Food Log' : 'Add Info'}
          </Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={currentLog?.isUploading || recordingState === 'recording'}
          >
            <Text style={[
              styles.saveButton,
              (currentLog?.isUploading || recordingState === 'recording') && styles.saveButtonDisabled
            ]}>
              {currentLog?.isUploading ? 'Uploading...' : 
               recordingState === 'recording' ? 'Recording' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

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
            label={`Title${(currentLog?.imageUrl || currentLog?.localImageUri) ? ' (Optional)' : ''}`}
            value={tempTitle}
            onChangeText={setTempTitle}
            placeholder={(currentLog?.imageUrl || currentLog?.localImageUri) ? 'Enter food title (AI will generate if empty)' : 'Enter food title'}
            readOnly={recordingState === 'recording'}
          />

          {currentLog?.isTranscribing ? (
            <DescriptionSkeleton label="Description (Optional)" />
          ) : (
            <FormField
              label="Description (Optional)"
              value={tempDescription}
              onChangeText={setTempDescription}
              placeholder={recordingState === 'recording' 
                ? 'Voice recording in progress...' 
                : 'Add details about preparation, ingredients, portion size, etc.'
              }
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

        {/* Floating Stop Button - only show when recording */}
        {recordingState === 'recording' && (
          <FloatingStopButton onPress={handleStopRecording} />
        )}
      </SafeAreaView>
    </Modal>
  );
};