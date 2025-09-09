import React from "react";
import { View } from "react-native";
import { CameraIcon, MicIcon, Sparkles } from "lucide-react-native";
import { useTheme } from "@/theme";
import { Button } from "@/components";
import { RoundButton } from "@/components/shared/RoundButton";
import { createStyles } from "./KeyboardAccessory.styles";

interface KeyboardAccessoryProps {
  onImagePicker?: () => void;
  onRecording?: () => void;
  onEstimate: () => void;
  estimateLabel: string;
  canContinue: boolean;
}

export const KeyboardAccessory: React.FC<KeyboardAccessoryProps> = ({
  onImagePicker,
  onRecording,
  onEstimate,
  estimateLabel,
  canContinue,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <View style={styles.container}>
      <View style={styles.mediaActionContainer}>
        {onImagePicker && (
          <RoundButton
            variant="tertiary"
            onPress={onImagePicker}
            Icon={CameraIcon}
          />
        )}
        {onRecording && (
          <RoundButton
            variant="tertiary"
            onPress={onRecording}
            Icon={MicIcon}
          />
        )}
      </View>
      <Button
        variant="primary"
        label={estimateLabel}
        onPress={onEstimate}
        disabled={!canContinue}
        Icon={Sparkles}
      />
    </View>
  );
};
