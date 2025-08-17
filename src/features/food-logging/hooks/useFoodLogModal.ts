import { useState } from "react";
import { FoodLog, ModalMode } from "@/types";

export interface UseFoodLogModalReturn {
  isModalVisible: boolean;
  modalMode: ModalMode;
  selectedLog: FoodLog | null;
  isAudioMode: boolean;
  isFavoritesModalVisible: boolean;
  handleAddInfo: (log: FoodLog) => void;
  handleManualLog: () => void;
  handleImageCaptured: (log: FoodLog) => void;
  handleAudioTranscribed: (log: FoodLog) => void;
  handleAudioLog: () => void;
  handleFavoritesLog: () => void;
  handleModalClose: (wasSaved?: boolean) => void;
  handleFavoritesModalClose: () => void;
  setSelectedLog: (log: FoodLog | null) => void;
  setModalMode: (mode: ModalMode) => void;
  setIsModalVisible: (visible: boolean) => void;
}

/**
 * Custom hook for managing food log modal state and handlers
 * Extracts modal-related logic from App.tsx for better separation of concerns
 */
export function useFoodLogModal(
  onSaveClose?: () => void
): UseFoodLogModalReturn {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("edit");
  const [selectedLog, setSelectedLog] = useState<FoodLog | null>(null);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [isFavoritesModalVisible, setIsFavoritesModalVisible] = useState(false);

  const handleAddInfo = (log: FoodLog) => {
    setModalMode("edit");
    setSelectedLog(log);
    setIsAudioMode(false);
    setIsModalVisible(true);
  };

  const handleManualLog = () => {
    setModalMode("create");
    setSelectedLog(null);
    setIsAudioMode(false);
    setIsModalVisible(true);
  };

  const handleImageCaptured = (log: FoodLog) => {
    // Don't add to state yet - just open modal for user input
    // The skeleton will be added after modal closes
    setModalMode("create");
    // Merge defensively to avoid overwriting newer upload progress
    setSelectedLog((prev) => {
      if (!prev || prev.id !== log.id) return log;
      // Prefer fields from the more up-to-date previous value (e.g., imageUrl, isUploading=false)
      return { ...log, ...prev };
    });
    setIsAudioMode(false);
    setIsModalVisible(true);
  };

  const handleAudioTranscribed = (log: FoodLog) => {
    // Similar to image captured, but for audio transcription
    setModalMode("create");
    setSelectedLog(log);
    setIsAudioMode(true);
    setIsModalVisible(true);
  };

  const handleAudioLog = () => {
    // Direct audio logging - opens modal in audio mode
    setModalMode("create");
    setSelectedLog(null);
    setIsAudioMode(true);
    setIsModalVisible(true);
  };

  const handleFavoritesLog = () => {
    setIsFavoritesModalVisible(true);
  };

  const handleFavoritesModalClose = () => {
    setIsFavoritesModalVisible(false);
  };

  const handleModalClose = (wasSaved?: boolean) => {
    setIsModalVisible(false);
    setSelectedLog(null);
    setIsAudioMode(false);

    // Trigger scroll to top if this was a save action
    if (wasSaved && onSaveClose) {
      onSaveClose();
    }
  };

  return {
    isModalVisible,
    modalMode,
    selectedLog,
    isAudioMode,
    isFavoritesModalVisible,
    handleAddInfo,
    handleManualLog,
    handleImageCaptured,
    handleAudioTranscribed,
    handleAudioLog,
    handleFavoritesLog,
    handleModalClose,
    handleFavoritesModalClose,
    setSelectedLog,
    setModalMode,
    setIsModalVisible,
  };
}
