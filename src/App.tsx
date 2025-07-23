import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './app-providers';
import { 
  FoodLogScreen, 
  FoodLogModal, 
  useFoodLogs 
} from './features/food-logging';
import { ImageCaptureButton } from './features/image-capture';
import { AudioRecordingButton } from './features/audio-recording';
import { ManualEntryButton } from './shared/ui';
import { FoodLog, ModalMode } from './types';
import { estimateNutritionTextBased, estimateNutritionImageBased } from './lib/supabase';
import { mergeNutritionData } from './features/food-logging/utils';

export default function App() {
  // Global state management
  const { 
    foodLogs, 
    isLoadingLogs, 
    addFoodLog, 
    updateFoodLogById, 
    deleteFoodLogById,
    updateFoodLogInState,
    addFoodLogToState 
  } = useFoodLogs();

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('edit');
  const [selectedLog, setSelectedLog] = useState<FoodLog | null>(null);

  // Handlers for opening modal in different modes
  const handleAddInfo = (log: FoodLog) => {
    setModalMode('edit');
    setSelectedLog(log);
    setIsModalVisible(true);
  };

  const handleManualLog = () => {
    setModalMode('create');
    setSelectedLog(null);
    setIsModalVisible(true);
  };

  const handleImageCaptured = async (log: FoodLog) => {
    // Don't add to state yet - just open modal for user input
    // The skeleton will be added after modal closes
    setModalMode('create');
    setSelectedLog(log);
    setIsModalVisible(true);
  };

  const handleAudioRecorded = async (log: FoodLog) => {
    // Add audio log to storage and state
    await addFoodLog(log);
  };

  const handleModalSave = async (log: FoodLog) => {
    if (modalMode === 'create') {
      if (selectedLog) {
        // Image capture case: Add skeleton with "Processing image..." and run AI in background
        const skeletonLog = {
          ...log,
          generatedTitle: 'Processing image...',
          estimationConfidence: 0,
        };
        
        // Add skeleton to state immediately
        addFoodLogToState(skeletonLog);
        
        // Run AI estimation in background if needed
        if (log.needsAiEstimation) {
          try {
            let estimation;
            if (log.imageUrl) {
              // Use image-based estimation
              estimation = await estimateNutritionImageBased({
                imageUrl: log.imageUrl,
                title: log.userTitle || undefined,
                description: log.userDescription || undefined,
              });
            } else {
              // Use text-based estimation (fallback)
              estimation = await estimateNutritionTextBased({
                title: log.userTitle || 'Food item',
                description: log.userDescription || undefined,
              });
            }

            // Merge AI data with user input (user input takes precedence)
            const mergedNutrition = mergeNutritionData(
              log.userCalories?.toString() || '', 
              log.userProtein?.toString() || '', 
              log.userCarbs?.toString() || '', 
              log.userFat?.toString() || '', 
              estimation
            );

            const finalLog = {
              ...log,
              generatedTitle: log.userTitle || estimation.generatedTitle,
              estimationConfidence: estimation.estimationConfidence,
              calories: mergedNutrition.calories,
              protein: mergedNutrition.protein,
              carbs: mergedNutrition.carbs,
              fat: mergedNutrition.fat,
              userCalories: mergedNutrition.userCalories,
              userProtein: mergedNutrition.userProtein,
              userCarbs: mergedNutrition.userCarbs,
              userFat: mergedNutrition.userFat,
              needsAiEstimation: undefined, // Remove the flag
            };

            // Update skeleton with final data and save to storage
            updateFoodLogInState(finalLog);
            await addFoodLog(finalLog);
          } catch (error) {
            console.error('Error with AI estimation:', error);
            // If AI fails, just save with user data
            const fallbackLog = { ...log, needsAiEstimation: undefined };
            updateFoodLogInState(fallbackLog);
            await addFoodLog(fallbackLog);
          }
        } else {
          // No AI needed, just save the log
          const finalLog = { ...log, needsAiEstimation: undefined };
          updateFoodLogInState(finalLog);
          await addFoodLog(finalLog);
        }
      } else {
        // Manual entry case: Handle similarly but without image
        if (log.needsAiEstimation) {
          // Add skeleton first
          const skeletonLog = {
            ...log,
            estimationConfidence: 0,
          };
          addFoodLogToState(skeletonLog);

          try {
            // Use text-based estimation
            const estimation = await estimateNutritionTextBased({
              title: log.userTitle || log.generatedTitle,
              description: log.userDescription || undefined,
            });

            // Merge AI data with user input
            const mergedNutrition = mergeNutritionData(
              log.userCalories?.toString() || '', 
              log.userProtein?.toString() || '', 
              log.userCarbs?.toString() || '', 
              log.userFat?.toString() || '', 
              estimation
            );

            const finalLog = {
              ...log,
              generatedTitle: log.userTitle || estimation.generatedTitle,
              estimationConfidence: estimation.estimationConfidence,
              calories: mergedNutrition.calories,
              protein: mergedNutrition.protein,
              carbs: mergedNutrition.carbs,
              fat: mergedNutrition.fat,
              userCalories: mergedNutrition.userCalories,
              userProtein: mergedNutrition.userProtein,
              userCarbs: mergedNutrition.userCarbs,
              userFat: mergedNutrition.userFat,
              needsAiEstimation: undefined,
            };

            updateFoodLogInState(finalLog);
            await addFoodLog(finalLog);
          } catch (error) {
            console.error('Error with AI estimation:', error);
            const fallbackLog = { ...log, needsAiEstimation: undefined };
            updateFoodLogInState(fallbackLog);
            await addFoodLog(fallbackLog);
          }
        } else {
          // No AI needed, add new log directly
          const finalLog = { ...log, needsAiEstimation: undefined };
          await addFoodLog(finalLog);
        }
      }
    } else {
      // Edit mode - update existing log and run AI in background if needed
      if (log.needsAiEstimation) {
        // Show skeleton state while processing
        const skeletonLog = {
          ...log,
          estimationConfidence: 0,
        };
        updateFoodLogInState(skeletonLog);

        try {
          let estimation;
          if (log.imageUrl) {
            // Use image-based estimation
            estimation = await estimateNutritionImageBased({
              imageUrl: log.imageUrl,
              title: log.userTitle || undefined,
              description: log.userDescription || undefined,
            });
          } else {
            // Use text-based estimation
            estimation = await estimateNutritionTextBased({
              title: log.userTitle || log.generatedTitle,
              description: log.userDescription || undefined,
            });
          }

          // Merge AI data with user input
          const mergedNutrition = mergeNutritionData(
            log.userCalories?.toString() || '', 
            log.userProtein?.toString() || '', 
            log.userCarbs?.toString() || '', 
            log.userFat?.toString() || '', 
            estimation
          );

          const finalLog = {
            ...log,
            generatedTitle: log.userTitle || estimation.generatedTitle,
            estimationConfidence: estimation.estimationConfidence,
            calories: mergedNutrition.calories,
            protein: mergedNutrition.protein,
            carbs: mergedNutrition.carbs,
            fat: mergedNutrition.fat,
            userCalories: mergedNutrition.userCalories,
            userProtein: mergedNutrition.userProtein,
            userCarbs: mergedNutrition.userCarbs,
            userFat: mergedNutrition.userFat,
            needsAiEstimation: undefined,
          };

          await updateFoodLogById(finalLog);
        } catch (error) {
          console.error('Error with AI estimation:', error);
          const fallbackLog = { ...log, needsAiEstimation: undefined };
          await updateFoodLogById(fallbackLog);
        }
      } else {
        // No AI needed, just update the log directly
        const finalLog = { ...log, needsAiEstimation: undefined };
        await updateFoodLogById(finalLog);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedLog(null);
  };

  return (
    <AppProvider>
      <StatusBar style="dark" />
      
      {/* Main Screen */}
      <FoodLogScreen
        foodLogs={foodLogs}
        isLoadingLogs={isLoadingLogs}
        onDeleteLog={deleteFoodLogById}
        onAddInfo={handleAddInfo}
      />

      {/* Modal */}
      <FoodLogModal
        visible={isModalVisible}
        mode={modalMode}
        selectedLog={selectedLog}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

      {/* Floating Action Buttons */}
      <ManualEntryButton onPress={handleManualLog} />
      <AudioRecordingButton onAudioRecorded={handleAudioRecorded} />
      <ImageCaptureButton onImageCaptured={handleImageCaptured} />
    </AppProvider>
  );
}