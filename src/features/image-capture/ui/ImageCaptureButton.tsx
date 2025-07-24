import React from "react";
import { View } from "react-native";
import { Button, LoadingSpinner } from "@/shared/ui";
import { useImageCapture } from "../hooks";
import { FoodLog } from "../../../types";
import { styles } from "./ImageCaptureButton.styles";
import FontAwesome from "@expo/vector-icons/FontAwesome";

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
        shape="round"
        color="primary"
        size="medium"
      >
        {isUploading ? (
          <LoadingSpinner color="#ffffff" size="small" />
        ) : (
          <FontAwesome name="camera" size={24} color="white" />
        )}
      </Button>
    </View>
  );
};
