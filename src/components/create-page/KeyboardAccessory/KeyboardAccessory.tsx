import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, TextInput } from "react-native";
import {
  CameraIcon,
  MicIcon,
  ImageIcon,
  Sparkles,
  Square,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useCameraPermissions } from "expo-camera";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import { Button } from "@/components";
import { RoundButton } from "@/components/shared/RoundButton";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { showErrorToast } from "@/lib/toast";
import { createStyles } from "./KeyboardAccessory.styles";

interface KeyboardAccessoryProps {
  onImageSelected?: (uri: string) => void;
  requestMicPermission?: () => Promise<boolean>;
  onRecording?: () => void;
  onStop?: () => void;
  onEstimate: () => void;
  estimateLabel: string;
  canContinue: boolean;
  textInputRef?: React.RefObject<TextInput | null>;
  logId?: string;
  isRecording?: boolean;
  volumeLevel?: number;
  isEstimating?: boolean;
}

// --- Smoother MiniWaveform Component ---
const MiniWaveform: React.FC<{ volumeLevel: number; isActive: boolean }> = ({
  volumeLevel,
  isActive,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);
  const BAR_COUNT = 32;
  const MIN_BAR_HEIGHT = 3;
  const MAX_BAR_HEIGHT = 42;

  // An array of shared values, one for each bar's height
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => useSharedValue(MIN_BAR_HEIGHT))
  ).current;

  // A shared value to hold the smoothed volume level. This is the key to reducing jitter.
  const smoothedVolume = useSharedValue(0);

  // When the raw volumeLevel prop changes, animate the smoothedVolume towards it.
  // This dampens rapid, jarring fluctuations.
  useEffect(() => {
    if (isActive) {
      smoothedVolume.value = withTiming(volumeLevel, {
        duration: 50,
        easing: Easing.out(Easing.quad),
      });
    } else {
      // When recording stops, gently animate all bars down to their minimum height.
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

  // This hook reacts to changes in the smoothedVolume and updates the individual bar heights.
  useAnimatedReaction(
    () => smoothedVolume.value, // The value to watch
    (currentVolume) => {
      if (!isActive) return;

      const center = Math.floor(BAR_COUNT / 2);
      // Use a power function to make lower volumes more visually responsive
      const enhancedVolume = Math.pow(currentVolume / 100, 0.75) * 100;

      bars.forEach((bar, idx) => {
        const distance = Math.abs(idx - center);
        const falloff = Math.pow(1 - distance / center, 2); // Sharper falloff from the center

        const targetHeight = Math.max(
          MIN_BAR_HEIGHT,
          Math.min(
            MAX_BAR_HEIGHT,
            (enhancedVolume / 100) * MAX_BAR_HEIGHT * falloff * 1.5
          )
        );

        // This is the core animation logic:
        // - If the target is higher, rise quickly (responsive feel).
        // - If the target is lower, fall slowly (natural decay).
        if (targetHeight > bar.value) {
          bar.value = withTiming(targetHeight, {
            duration: 120, // Quick rise
            easing: Easing.out(Easing.quad),
          });
        } else {
          bar.value = withTiming(targetHeight, {
            duration: 500, // Slower fall
            easing: Easing.out(Easing.cubic),
          });
        }
      });
    },
    [isActive]
  );

  return (
    <View style={styles.waveformContainer}>
      {bars.map((bar, i) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const animatedStyle = useAnimatedStyle(() => ({ height: bar.value }));
        return (
          <Animated.View key={i} style={[styles.waveformBar, animatedStyle]} />
        );
      })}
    </View>
  );
};

export const KeyboardAccessory: React.FC<KeyboardAccessoryProps> = ({
  onImageSelected,
  requestMicPermission,
  onRecording,
  onStop,
  onEstimate,
  estimateLabel,
  canContinue,
  textInputRef,
  logId,
  isRecording = false,
  volumeLevel = 0,
  isEstimating = false,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);
  const router = useSafeRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const containerRef = useRef<View | null>(null);
  const micAnchorRef = useRef<View | null>(null);
  const stopAnchorRef = useRef<View | null>(null);

  const [isTranscriptionVisible, setIsTranscriptionVisible] = useState(false);
  const isTranscriptionActive = useMemo(
    () => isTranscriptionVisible || isRecording,
    [isTranscriptionVisible, isRecording]
  );

  const defaultOpacity = useSharedValue(1);
  const transcriptionOpacity = useSharedValue(0);
  const waveformOpacity = useSharedValue(0);

  const stopX = useSharedValue(0);
  const stopScale = useSharedValue(1);
  const stopAlpha = useSharedValue(1);

  const defaultAnimatedStyle = useAnimatedStyle(() => ({
    opacity: defaultOpacity.value,
  }));
  const transcriptionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: transcriptionOpacity.value,
  }));
  const waveformStyle = useAnimatedStyle(() => ({
    opacity: waveformOpacity.value,
  }));
  const stopOverlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: stopX.value }, { scale: stopScale.value }],
    opacity: stopAlpha.value,
  }));

  const measureRelativeToContainer = useCallback(
    (target: View | null, cb: (x: number) => void) => {
      const container = containerRef.current as any;
      const node = target as any;
      if (!container || !node || !node.measureLayout) return;
      try {
        node.measureLayout(
          container,
          (x: number) => cb(x),
          () => {}
        );
      } catch (e) {
        console.warn("Failed to measure layout", e);
      }
    },
    []
  );

  const handleCameraPress = useCallback(async () => {
    textInputRef?.current?.blur();

    // Check and request camera permission before navigation
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
  }, [router, logId, textInputRef, cameraPermission, requestCameraPermission]);

  const handleMediaLibraryPress = useCallback(async () => {
    textInputRef?.current?.blur();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]?.uri && onImageSelected) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error launching image picker:", error);
    }
  }, [onImageSelected, textInputRef]);

  const handleMicPress = useCallback(async () => {
    // Request microphone permission before showing UI
    if (requestMicPermission) {
      const granted = await requestMicPermission();
      if (!granted) {
        showErrorToast(
          "Microphone permission denied",
          "Please allow microphone access in settings to use voice input."
        );
        return;
      }

      // Wait for iOS to initialize audio session and speech recognition service
      // This prevents race condition on first-time permission grant
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    measureRelativeToContainer(micAnchorRef.current, (x) => {
      stopX.value = x;
      stopScale.value = 0.85;
      stopAlpha.value = 0;
      setIsTranscriptionVisible(true); // Mount transcription UI
      defaultOpacity.value = withTiming(0, { duration: 120 });
      onRecording?.();
    });
  }, [
    measureRelativeToContainer,
    requestMicPermission,
    onRecording,
    stopX,
    defaultOpacity,
    stopScale,
    stopAlpha,
  ]);

  const handleStopPress = useCallback(() => {
    onStop?.();
    waveformOpacity.value = withTiming(0, {
      duration: 120,
      easing: Easing.in(Easing.cubic),
    });
    defaultOpacity.value = withDelay(80, withTiming(1, { duration: 240 }));

    measureRelativeToContainer(micAnchorRef.current, (x) => {
      const animConfig = { duration: 300, easing: Easing.inOut(Easing.cubic) };
      stopScale.value = withTiming(0.8, animConfig);
      stopAlpha.value = withTiming(0, animConfig);
      stopX.value = withTiming(x, animConfig, (finished) => {
        if (finished) {
          runOnJS(setIsTranscriptionVisible)(false);
        }
      });
    });
  }, [
    measureRelativeToContainer,
    defaultOpacity,
    stopX,
    onStop,
    waveformOpacity,
    stopScale,
    stopAlpha,
  ]);

  useEffect(() => {
    if (isTranscriptionVisible) {
      transcriptionOpacity.value = 0;
      waveformOpacity.value = 0;
      requestAnimationFrame(() => {
        measureRelativeToContainer(stopAnchorRef.current, (x) => {
          const animConfig = {
            duration: 280,
            easing: Easing.out(Easing.cubic),
          };
          transcriptionOpacity.value = withTiming(1, { duration: 140 });
          waveformOpacity.value = withTiming(1, { duration: 200 });
          stopX.value = withTiming(x, animConfig);
          stopScale.value = withTiming(1, animConfig);
          stopAlpha.value = withTiming(1, animConfig);
        });
      });
    }
  }, [
    isTranscriptionVisible,
    measureRelativeToContainer,
    transcriptionOpacity,
    waveformOpacity,
    stopX,
    stopScale,
    stopAlpha,
  ]);

  return (
    <View ref={containerRef} style={styles.container}>
      <Animated.View
        style={[
          {
            flex: 1,
            flexDirection: "row",
            gap: theme.spacing.sm,
            alignItems: "center",
          },
          defaultAnimatedStyle,
        ]}
      >
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
            <View ref={micAnchorRef}>
              <RoundButton
                variant="tertiary"
                onPress={handleMicPress}
                Icon={MicIcon}
              />
            </View>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Button
            variant="primary"
            label={estimateLabel}
            onPress={onEstimate}
            disabled={!canContinue}
            isLoading={isEstimating}
            Icon={Sparkles}
          />
        </View>
      </Animated.View>

      {isTranscriptionVisible && (
        <>
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                padding: theme.spacing.sm,
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.sm,
              },
              transcriptionAnimatedStyle,
            ]}
            pointerEvents="none"
          >
            <Animated.View style={[{ flex: 1, minWidth: 0 }, waveformStyle]}>
              <MiniWaveform
                volumeLevel={volumeLevel}
                isActive={isTranscriptionActive}
              />
            </Animated.View>
            <View
              ref={stopAnchorRef}
              style={{ opacity: 0 }}
              pointerEvents="none"
            >
              <RoundButton
                variant="red"
                onPress={() => {}}
                Icon={Square}
                disabled
              />
            </View>
          </Animated.View>
          <Animated.View
            style={[
              { position: "absolute", left: 0, top: theme.spacing.sm },
              stopOverlayStyle,
            ]}
          >
            <RoundButton
              variant="red"
              onPress={handleStopPress}
              Icon={Square}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
};
