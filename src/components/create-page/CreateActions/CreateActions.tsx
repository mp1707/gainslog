import React, { useCallback } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
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
  isRecordingActive: boolean;
}

export const CreateActions: React.FC<CreateActionsProps> = ({
  onSwitchToCamera,
  onSwitchToRecording,
  onEstimate,
  canContinue,
  isEstimating = false,
  isRecordingActive = false,
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
        {!isRecordingActive && (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(120)}
            style={styles.secondaryActions}
          >
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
                systemName: isRecordingActive ? "square" : "mic.fill",
                color: iconColor,
              }}
            />
          </Animated.View>
        )}
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
