import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, TextInput, StyleProp, ViewStyle } from "react-native";
import { useCameraPermissions } from "expo-camera";
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { showErrorToast } from "@/lib/toast";
import { createStyles } from "./KeyboardAccessory.styles";
import { HeaderButton } from "@/components/shared/HeaderButton/HeaderButton.ios";
import { AppText } from "@/components/shared/AppText";

interface KeyboardAccessoryProps {
  requestMicPermission?: () => Promise<boolean>;
  onRecording?: () => Promise<void> | void;
  onStop?: () => Promise<void> | void;
  onEstimate: () => void;
  canContinue: boolean;
  textInputRef?: React.RefObject<TextInput | null>;
  logId?: string;
  isRecording?: boolean;
  volumeLevel?: number;
  isEstimating?: boolean;
  isFavoritesActive: boolean;
  onToggleFavorites: () => void;
  onEnsureEstimationMode: () => void;
}

const MiniWaveform: React.FC<{
  volumeLevel: number;
  isActive: boolean;
  containerStyle: StyleProp<ViewStyle>;
  barStyle: StyleProp<ViewStyle>;
}> = ({ volumeLevel, isActive, containerStyle, barStyle }) => {
  const BAR_COUNT = 32;
  const MIN_BAR_HEIGHT = 3;
  const MAX_BAR_HEIGHT = 42;

  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => useSharedValue(MIN_BAR_HEIGHT))
  ).current;
  const smoothedVolume = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      smoothedVolume.value = withTiming(volumeLevel, {
        duration: 50,
        easing: Easing.out(Easing.quad),
      });
    } else {
      smoothedVolume.value = withTiming(0, { duration: 400 });
      bars.forEach((bar) => {
        bar.value = withDelay(
          100,
          withTiming(MIN_BAR_HEIGHT, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
          })
        );
      });
    }
  }, [volumeLevel, isActive, smoothedVolume, bars]);

  useAnimatedReaction(
    () => smoothedVolume.value,
    (currentVolume) => {
      if (!isActive) return;

      const center = Math.floor(BAR_COUNT / 2);
      const enhancedVolume = Math.pow(currentVolume / 100, 0.75) * 100;

      bars.forEach((bar, idx) => {
        const distance = Math.abs(idx - center);
        const falloff = Math.pow(1 - distance / center, 2);

        const targetHeight = Math.max(
          MIN_BAR_HEIGHT,
          Math.min(
            MAX_BAR_HEIGHT,
            (enhancedVolume / 100) * MAX_BAR_HEIGHT * falloff * 1.5
          )
        );

        if (targetHeight > bar.value) {
          bar.value = withTiming(targetHeight, {
            duration: 120,
            easing: Easing.out(Easing.quad),
          });
        } else {
          bar.value = withTiming(targetHeight, {
            duration: 500,
            easing: Easing.out(Easing.cubic),
          });
        }
      });
    },
    [isActive]
  );

  return (
    <View style={containerStyle}>
      {bars.map((bar, index) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const animatedStyle = useAnimatedStyle(() => ({ height: bar.value }));
        return <Animated.View key={index} style={[barStyle, animatedStyle]} />;
      })}
    </View>
  );
};

export const KeyboardAccessory: React.FC<KeyboardAccessoryProps> = ({
  requestMicPermission,
  onRecording,
  onStop,
  onEstimate,
  canContinue,
  textInputRef,
  logId,
  isRecording = false,
  volumeLevel = 0,
  isEstimating = false,
  isFavoritesActive,
  onToggleFavorites,
  onEnsureEstimationMode,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);
  const router = useSafeRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);

  useEffect(() => {
    if (!isRecording) {
      setIsTranscriptionVisible(false);
    }
  }, [isRecording]);

  const confirmDisabled = isFavoritesActive || !canContinue || isEstimating;
  const iconColor = colorScheme === "dark" ? colors.white : colors.primaryText;

  const showWaveform = useMemo(
    () => isTranscriptionVisible || isRecording,
    [isTranscriptionVisible, isRecording]
  );

  const actionsOpacity = useSharedValue(showWaveform ? 0 : 1);
  const actionsTranslateY = useSharedValue(showWaveform ? -12 : 0);
  const waveformOpacity = useSharedValue(showWaveform ? 1 : 0);
  const waveformTranslateY = useSharedValue(showWaveform ? 0 : 12);

  useEffect(() => {
    if (showWaveform) {
      actionsOpacity.value = withTiming(0, {
        duration: 160,
        easing: Easing.out(Easing.cubic),
      });
      actionsTranslateY.value = withTiming(-12, {
        duration: 160,
        easing: Easing.out(Easing.cubic),
      });
      waveformOpacity.value = withDelay(
        80,
        withTiming(1, {
          duration: 220,
          easing: Easing.out(Easing.cubic),
        })
      );
      waveformTranslateY.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      waveformOpacity.value = withTiming(0, {
        duration: 140,
        easing: Easing.out(Easing.cubic),
      });
      waveformTranslateY.value = withTiming(12, {
        duration: 140,
        easing: Easing.out(Easing.cubic),
      });
      actionsOpacity.value = withDelay(
        50,
        withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        })
      );
      actionsTranslateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [
    showWaveform,
    actionsOpacity,
    actionsTranslateY,
    waveformOpacity,
    waveformTranslateY,
  ]);

  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
    transform: [{ translateY: actionsTranslateY.value }],
  }));

  const waveformAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveformOpacity.value,
    transform: [{ translateY: waveformTranslateY.value }],
  }));

  const handleCameraPress = useCallback(async () => {
    onEnsureEstimationMode();
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
  }, [
    onEnsureEstimationMode,
    textInputRef,
    cameraPermission,
    requestCameraPermission,
    router,
    logId,
  ]);

  const handleMicPress = useCallback(async () => {
    if (showWaveform) {
      return;
    }

    onEnsureEstimationMode();
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

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setIsTranscriptionVisible(true);
    try {
      await onRecording?.();
    } catch (_error) {
      setIsTranscriptionVisible(false);
    }
  }, [
    showWaveform,
    onEnsureEstimationMode,
    textInputRef,
    requestMicPermission,
    onRecording,
  ]);

  const handleStopPress = useCallback(async () => {
    try {
      await onStop?.();
    } finally {
      setIsTranscriptionVisible(false);
      textInputRef?.current?.focus();
    }
  }, [onStop, textInputRef]);

  const handleConfirmPress = useCallback(() => {
    if (!confirmDisabled) {
      onEstimate();
    }
  }, [confirmDisabled, onEstimate]);

  const waveformSubtitle = "Listening… describe your meal aloud.";

  const containerTranslateY = useSharedValue(0);

  useEffect(() => {
    containerTranslateY.value = withTiming(showWaveform ? -4 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [showWaveform, containerTranslateY]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: containerTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <Animated.View
        style={[styles.layer, styles.actionsLayer, actionsAnimatedStyle]}
        pointerEvents={showWaveform ? "none" : "auto"}
      >
        <View style={styles.actionsRow}>
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
            variant={isFavoritesActive ? "colored" : "regular"}
            buttonProps={{
              onPress: onToggleFavorites,
              color: isFavoritesActive
                ? colors.semantic.fat
                : colors.secondaryBackground,
            }}
            imageProps={{
              systemName: isFavoritesActive ? "star.fill" : "star",
              color: isFavoritesActive ? colors.black : iconColor,
            }}
          />
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
              color: colors.accent,
            }}
            imageProps={{
              systemName: "checkmark",
              color: colors.black,
            }}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={[styles.layer, styles.waveformLayer, waveformAnimatedStyle]}
        pointerEvents={showWaveform ? "auto" : "none"}
      >
        <View style={styles.waveformPanel}>
          <View style={styles.waveformRow}>
            <MiniWaveform
              volumeLevel={volumeLevel}
              isActive={isRecording}
              containerStyle={styles.waveformContainer}
              barStyle={styles.waveformBar}
            />
            <HeaderButton
              variant="colored"
              buttonProps={{
                onPress: handleStopPress,
                color: colors.recording,
              }}
              imageProps={{
                systemName: "stop.fill",
                color: colors.white,
              }}
            />
          </View>
          <AppText role="Caption" style={styles.waveformSubtitle}>
            {waveformSubtitle}
          </AppText>
        </View>
      </Animated.View>
    </Animated.View>
  );
};
