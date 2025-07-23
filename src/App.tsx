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
    // DON'T save to storage yet - just add to state as skeleton
    // The modal save will handle persistence
    addFoodLogToState(log);
    
    // Automatically open modal for user to add optional info
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
        // Image capture case: Replace skeleton in state and save to storage
        updateFoodLogInState(log);
        await addFoodLog(log);
      } else {
        // Manual entry case: Add new log to storage and state
        await addFoodLog(log);
      }
    } else {
      // Edit mode - update existing log in storage and state
      await updateFoodLogById(log);
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