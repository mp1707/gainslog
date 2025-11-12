import React, { useCallback } from "react";
import { View, TextInput } from "react-native";
import { useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { showErrorToast } from "@/lib/toast";
import { createStyles } from "./KeyboardAccessory.styles";
import { HeaderButton } from "@/components/shared/HeaderButton/HeaderButton.ios";
import { Waveform } from "@/components/create-page/Waveform";

interface KeyboardAccessoryProps {
  requestMicPermission?: () => Promise<boolean>;
  onRecording?: () => Promise<void> | void;
  onStopRecording?: () => Promise<void> | void;
  onEstimate: () => void;
  canContinue: boolean;
  textInputRef?: React.RefObject<TextInput | null>;
  logId?: string;
  isEstimating?: boolean;
  isRecording?: boolean;
  isTransitioning?: boolean;
  volumeLevel?: number;
}

export const KeyboardAccessory: React.FC<KeyboardAccessoryProps> = ({
  requestMicPermission,
  onRecording,
  onStopRecording,
  onEstimate,
  canContinue,
  textInputRef,
  logId,
  isEstimating = false,
  isRecording = false,
  isTransitioning = false,
  volumeLevel = 0,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);
  const { t } = useTranslation();
  const router = useSafeRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const isFocused = textInputRef?.current?.isFocused() || false;

  const confirmDisabled =
    !canContinue || isEstimating || isRecording || isTransitioning;
  const cameraDisabled = isRecording || isTransitioning;
  const micDisabled = isTransitioning;
  const stopDisabled = isTransitioning;
  const iconColor = colorScheme === "dark" ? colors.white : colors.primaryText;

  const handleCameraPress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    textInputRef?.current?.blur();

    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        showErrorToast(
          t("createLog.permissions.cameraDenied.title"),
          t("createLog.permissions.cameraDenied.message")
        );
        return;
      }
    }

    router.push(logId ? `/camera?logId=${logId}` : `/camera`);
  }, [
    textInputRef,
    cameraPermission,
    requestCameraPermission,
    router,
    logId,
    t,
  ]);

  const handleMicPress = useCallback(() => {
    // Focus immediately (synchronous) to keep keyboard open
    textInputRef?.current?.focus();

    // Then handle async operations
    (async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (requestMicPermission) {
        const granted = await requestMicPermission();
        if (!granted) {
          showErrorToast(
            t("createLog.permissions.microphoneDenied.title"),
            t("createLog.permissions.microphoneDenied.message")
          );
          return;
        }
      }

      // Call recording without awaiting for instant UI response
      onRecording?.();
    })();
  }, [textInputRef, requestMicPermission, onRecording, t]);

  const handleConfirmPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEstimate();
  }, [onEstimate]);

  const handleStopPress = useCallback(() => {
    // Keep keyboard open (focus immediately)
    textInputRef?.current?.focus();

    // Then handle stop recording and haptics
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStopRecording?.();
  }, [textInputRef, onStopRecording]);

  return (
    <View style={styles.container}>
      {isRecording ? (
        <Waveform
          volumeLevel={volumeLevel}
          isActive
          containerStyle={[
            styles.waveformContainer,
            { transform: [{ translateY: isFocused ? 0 : 44 }] },
            { position: "absolute", top: isFocused ? -4 : -24 },
            { pointerEvents: "none" },
          ]}
          barStyle={styles.waveformBar}
        />
      ) : null}
      <View style={styles.actionsRow}>
        {isRecording ? (
          <HeaderButton
            variant="regular"
            buttonProps={{
              onPress: handleStopPress,
              disabled: stopDisabled,
              color: colors.secondaryBackground,
            }}
            imageProps={{
              systemName: "stop.fill",
              color: stopDisabled ? colors.disabledText : colors.white,
            }}
          />
        ) : (
          <HeaderButton
            variant="regular"
            buttonProps={{
              onPress: handleMicPress,
              disabled: micDisabled,
              color: colors.secondaryBackground,
            }}
            imageProps={{
              systemName: "mic.fill",
              color: micDisabled ? colors.disabledText : iconColor,
            }}
          />
        )}
        <HeaderButton
          variant="regular"
          buttonProps={{
            onPress: handleCameraPress,
            disabled: cameraDisabled,
            color: colors.secondaryBackground,
          }}
          imageProps={{
            systemName: "camera",
            color: cameraDisabled ? colors.disabledText : iconColor,
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
