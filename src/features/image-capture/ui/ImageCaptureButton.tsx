import React from 'react';
import { View } from 'react-native';
import { Button, LoadingSpinner } from '@/shared/ui';
import { useImageCapture } from '../hooks';
import { FoodLog } from '../../../types';
import { styles } from './ImageCaptureButton.styles';

interface ImageCaptureButtonProps {
  onImageCaptured: (log: FoodLog) => void;
}

export const ImageCaptureButton: React.FC<ImageCaptureButtonProps> = ({
  onImageCaptured,
}) => {
  const { isUploading, captureImage } = useImageCapture();

  const handleCapture = async () => {
    const log = await captureImage();
    if (log) {
      onImageCaptured(log);
    }
  };

  return (
    <View style={styles.button}>
      <Button
        onPress={handleCapture}
        disabled={isUploading}
        variant="primary"
        size="medium"
      >
        {isUploading ? (
          <LoadingSpinner color="#ffffff" size="small" />
        ) : (
          '📷'
        )}
      </Button>
    </View>
  );
};