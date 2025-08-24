import React, { useCallback } from "react";
import { useAppStore } from "@/store";
import { NewLogSheet } from "@/components/daily-food-logs/NewLogSheet";

interface NewLogButtonProps {
  visible: boolean;
  onClose: () => void;
  onFavoritesLog?: () => void;
}

export const NewLogButton: React.FC<NewLogButtonProps> = ({
  visible,
  onClose,
  onFavoritesLog,
}) => {
  // Store action triggers
  const triggerManualLog = useAppStore((state) => state.triggerManualLog);
  const triggerCameraCapture = useAppStore(
    (state) => state.triggerCameraCapture
  );
  const triggerLibraryCapture = useAppStore(
    (state) => state.triggerLibraryCapture
  );
  const triggerAudioCapture = useAppStore((state) => state.triggerAudioCapture);
  const triggerFavorites = useAppStore((state) => state.triggerFavorites);

  // Memoized handlers
  const handleManualLog = useCallback(() => {
    triggerManualLog();
  }, [triggerManualLog]);

  const handleCameraLog = useCallback(() => {
    triggerCameraCapture();
  }, [triggerCameraCapture]);

  const handleLibraryLog = useCallback(() => {
    triggerLibraryCapture();
  }, [triggerLibraryCapture]);

  const handleAudioLog = useCallback(() => {
    triggerAudioCapture();
  }, [triggerAudioCapture]);

  const handleFavoritesLog = useCallback(() => {
    triggerFavorites();
  }, [triggerFavorites]);

  return (
    <NewLogSheet
      visible={visible}
      onClose={onClose}
      onManualLog={handleManualLog}
      onCameraLog={handleCameraLog}
      onLibraryLog={handleLibraryLog}
      onAudioLog={handleAudioLog}
      onFavoritesLog={handleFavoritesLog}
    />
  );
};
