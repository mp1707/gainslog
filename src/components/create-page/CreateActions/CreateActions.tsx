import React, { useCallback } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { createStyles } from "./CreateActions.styles";
import { HeaderButton } from "@/components/shared/HeaderButton/HeaderButton.ios";

interface CreateActionsProps {
  onSwitchToCamera: () => void;
  onSwitchToRecording: () => void;
  onEstimate: () => void;
  canContinue: boolean;
  isEstimating?: boolean;
}

export const CreateActions: React.FC<CreateActionsProps> = ({
  onSwitchToCamera,
  onSwitchToRecording,
  onEstimate,
  canContinue,
  isEstimating = false,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);

  const confirmDisabled = !canContinue || isEstimating;
  const iconColor = colorScheme === "dark" ? colors.white : colors.primaryText;

  const handleCameraPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwitchToCamera();
  }, [onSwitchToCamera]);

  const handleMicPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwitchToRecording();
  }, [onSwitchToRecording]);

  const handleConfirmPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEstimate();
  }, [onEstimate]);

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <HeaderButton
          variant="regular"
          buttonProps={{
            onPress: handleCameraPress,
            color: colors.secondaryBackground,
          }}
          imageProps={{
            systemName: "camera",
            color: iconColor,
          }}
        />
        <HeaderButton
          variant="regular"
          buttonProps={{
            onPress: handleMicPress,
            color: colors.secondaryBackground,
          }}
          imageProps={{
            systemName: "mic.fill",
            color: iconColor,
          }}
        />
        <HeaderButton
          variant="colored"
          buttonProps={{
            onPress: handleConfirmPress,
            disabled: confirmDisabled,
            color: confirmDisabled ? "transparent" : colors.accent,
          }}
          imageProps={{
            systemName: "checkmark",
            color: confirmDisabled ? colors.disabledText : colors.black,
          }}
        />
      </View>
    </View>
  );
};
