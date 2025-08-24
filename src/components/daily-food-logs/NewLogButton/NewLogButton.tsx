import React, { useCallback } from "react";
import { useFoodLogStore } from "src/legacystore/useFoodLogStore";
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
  const triggerManualLog = useFoodLogStore((state) => state.triggerManualLog);
  const triggerCameraCapture = useFoodLogStore(
    (state) => state.triggerCameraCapture
  );
  const triggerLibraryCapture = useFoodLogStore(
    (state) => state.triggerLibraryCapture
  );
  const triggerAudioCapture = useFoodLogStore(
    (state) => state.triggerAudioCapture
  );
  const triggerFavorites = useFoodLogStore((state) => state.triggerFavorites);

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
