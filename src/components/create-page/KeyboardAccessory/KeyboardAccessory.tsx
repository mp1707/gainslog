import React, { useCallback } from "react";
import { View, TextInput, ActivityIndicator } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useTheme } from "@/theme";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { showErrorToast } from "@/lib/toast";
import { createStyles } from "./KeyboardAccessory.styles";
import { HeaderButton } from "@/components/shared/HeaderButton/HeaderButton.ios";

interface KeyboardAccessoryProps {
  requestMicPermission?: () => Promise<boolean>;
  onRecording?: () => Promise<void> | void;
  onEstimate: () => void;
  canContinue: boolean;
  textInputRef?: React.RefObject<TextInput | null>;
  logId?: string;
  isEstimating?: boolean;
  isPreparing?: boolean;
}

export const KeyboardAccessory: React.FC<KeyboardAccessoryProps> = ({
  requestMicPermission,
  onRecording,
  onEstimate,
  canContinue,
  textInputRef,
  logId,
  isEstimating = false,
  isPreparing = false,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);
  const router = useSafeRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const confirmDisabled = !canContinue || isEstimating;
  const iconColor = colorScheme === "dark" ? colors.white : colors.primaryText;

  const handleCameraPress = useCallback(async () => {
    textInputRef?.current?.blur();

    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        showErrorToast(
          "Camera permission denied",
          "Please allow camera access in settings to take photos."
        );
        return;
      }
    }

    router.push(logId ? `/camera?logId=${logId}` : `/camera`);
  }, [textInputRef, cameraPermission, requestCameraPermission, router, logId]);

  const handleMicPress = useCallback(async () => {
    textInputRef?.current?.blur();

    if (requestMicPermission) {
      const granted = await requestMicPermission();
      if (!granted) {
        showErrorToast(
          "Microphone permission denied",
          "Please allow microphone access in settings to use voice input."
        );
        return;
      }
    }

    await onRecording?.();
  }, [textInputRef, requestMicPermission, onRecording]);

  const handleConfirmPress = useCallback(() => {
    if (!confirmDisabled) {
      onEstimate();
    }
  }, [confirmDisabled, onEstimate]);

  return (
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        {isPreparing ? (
          <View
            style={{
              width: 44,
              height: 44,
              backgroundColor: colors.secondaryBackground,
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="small" color={iconColor} />
          </View>
        ) : (
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
        )}
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
