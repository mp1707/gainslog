import React, { useCallback } from "react";
import { View } from "react-native";
import { CameraIcon, MicIcon, ImageIcon, Sparkles } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/theme";
import { Button } from "@/components";
import { RoundButton } from "@/components/shared/RoundButton";
import { createStyles } from "./KeyboardAccessory.styles";

interface KeyboardAccessoryProps {
  onImageSelected?: (uri: string) => void;
  onRecording?: () => void;
  onEstimate: () => void;
  estimateLabel: string;
  canContinue: boolean;
}

export const KeyboardAccessory: React.FC<KeyboardAccessoryProps> = ({
  onImageSelected,
  onRecording,
  onEstimate,
  estimateLabel,
  canContinue,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const handleCameraPress = useCallback(async () => {
    // ... get uri from camera
    // onImageSelected(uri);
  }, [onImageSelected]);

  const handleMediaLibraryPress = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0] && onImageSelected) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error launching image picker:", error);
    }
  }, [onImageSelected]);

  return (
    <View style={styles.container}>
      <View style={styles.mediaActionContainer}>
        <RoundButton
          variant="tertiary"
          onPress={handleCameraPress}
          Icon={CameraIcon}
        />
        <RoundButton
          variant="tertiary"
          onPress={handleMediaLibraryPress}
          Icon={ImageIcon}
        />
        {onRecording && (
          <RoundButton
            variant="tertiary"
            onPress={onRecording}
            Icon={MicIcon}
          />
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Button
          variant="primary"
          label={estimateLabel}
          onPress={onEstimate}
          disabled={!canContinue}
          Icon={Sparkles}
        />
      </View>
    </View>
  );
};
