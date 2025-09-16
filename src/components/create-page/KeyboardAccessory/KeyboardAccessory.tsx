import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, TextInput } from "react-native";
import { CameraIcon, MicIcon, ImageIcon, Sparkles } from "lucide-react-native";
import { Square } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useTheme } from "@/theme";
import { Button } from "@/components";
import { RoundButton } from "@/components/shared/RoundButton";
import { createStyles } from "./KeyboardAccessory.styles";

interface KeyboardAccessoryProps {
  onImageSelected?: (uri: string) => void;
  onRecording?: () => void;
  onStop?: () => void;
  onEstimate: () => void;
  estimateLabel: string;
  canContinue: boolean;
  textInputRef?: React.RefObject<TextInput | null>;
  logId?: string;
  isRecording?: boolean;
  volumeLevel?: number;
}

export const KeyboardAccessory: React.FC<KeyboardAccessoryProps> = ({
  onImageSelected,
  onRecording,
  onStop,
  onEstimate,
  estimateLabel,
  canContinue,
  textInputRef,
  logId,
  isRecording = false,
  volumeLevel = 0,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const router = useRouter();

  // Layout refs to measure exact positions
  const containerRef = useRef<View | null>(null);
  const micAnchorRef = useRef<View | null>(null);
  const stopAnchorRef = useRef<View | null>(null);

  // Local UI state to drive the transition even before parent flips isRecording
  const [showTranscription, setShowTranscription] = useState(false);
  const isTranscriptionActive = useMemo(
    () => showTranscription || isRecording,
    [showTranscription, isRecording]
  );

  // Opacity per group
  const defaultOpacity = useSharedValue(1);
  const transcriptionOpacity = useSharedValue(0);
  const defaultAnimatedStyle = useAnimatedStyle(() => ({ opacity: defaultOpacity.value }));
  const transcriptionAnimatedStyle = useAnimatedStyle(() => ({ opacity: transcriptionOpacity.value }));

  // Waveform opacity (independent for rapid fade out)
  const waveformOpacity = useSharedValue(0);
  const waveformStyle = useAnimatedStyle(() => ({ opacity: waveformOpacity.value }));

  // Stop button overlay position (absolute, left-based)
  const [overlayVisible, setOverlayVisible] = useState(false);
  const stopX = useSharedValue(0);
  const stopScale = useSharedValue(1);
  const stopAlpha = useSharedValue(1);
  const stopOverlayStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: stopX.value }, { scale: stopScale.value }],
    opacity: stopAlpha.value,
  }));

  const handleCameraPress = useCallback(async () => {
    textInputRef?.current?.blur();
    if (logId) {
      router.push(`/camera?logId=${logId}`);
    } else {
      router.push(`/camera`);
    }
  }, [router, logId]);

  const handleMediaLibraryPress = useCallback(async () => {
    textInputRef?.current?.blur();
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

  // Helper to measure a child relative to container
  const measureRelativeToContainer = useCallback(
    (target: View | null, cb: (x: number, y: number, w: number, h: number) => void) => {
      const container = containerRef.current as any;
      const node = target as any;
      if (!container || !node || !node.measureLayout) return;
      try {
        node.measureLayout(container, (x: number, y: number, w: number, h: number) => cb(x, y, w, h), () => {});
      } catch {}
    },
    []
  );

  const handleMicPress = useCallback(() => {
    // Measure mic anchor position relative to the container, then start transition
    measureRelativeToContainer(micAnchorRef.current, (x) => {
      stopX.value = x; // start at mic's left
      stopScale.value = 0.85; // prepare intro scale
      stopAlpha.value = 0; // prepare intro opacity
      setOverlayVisible(true);
      defaultOpacity.value = withTiming(0, { duration: 120 });
      setShowTranscription(true); // mount transcription content
      // after mount, we'll measure stop anchor and animate in useEffect below
      onRecording?.();
    });
  }, [measureRelativeToContainer, onRecording, stopX, defaultOpacity, stopScale, stopAlpha]);

  const handleStopPress = useCallback(() => {
    // Rapidly fade waveform
    waveformOpacity.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.cubic) });
    // Animate stop back to mic position while default fades in slightly delayed for smoothness
    defaultOpacity.value = withDelay(80, withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) }));
    measureRelativeToContainer(micAnchorRef.current, (x) => {
      // During the slide back, also scale and fade the stop out completely
      stopScale.value = withTiming(0.8, { duration: 300, easing: Easing.inOut(Easing.cubic) });
      stopAlpha.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.cubic) });
      stopX.value = withTiming(x, { duration: 300, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(setShowTranscription)(false);
          runOnJS(setOverlayVisible)(false);
        }
      });
    });
    onStop?.();
  }, [measureRelativeToContainer, defaultOpacity, stopX, onStop, waveformOpacity, stopScale, stopAlpha]);

  // Inline mini waveform (compact version)
  const MiniWaveform: React.FC<{ volumeLevel: number; isActive: boolean }> = ({ volumeLevel, isActive }) => {
    const BAR_COUNT = 32;
    const MIN_BAR_HEIGHT = 4;
    const MAX_BAR_HEIGHT = 28;

    const bars = React.useRef(
      Array.from({ length: BAR_COUNT }, () => useSharedValue(3))
    ).current;

    React.useEffect(() => {
      if (!isActive) {
        bars.forEach((sv) => (sv.value = withTiming(3, { duration: 250 })));
        return;
      }
      const center = Math.floor(BAR_COUNT / 2);
      const base = Math.max(
        MIN_BAR_HEIGHT,
        Math.min(MAX_BAR_HEIGHT, (volumeLevel / 100) * MAX_BAR_HEIGHT)
      );
      bars.forEach((sv, idx) => {
        const distance = Math.abs(idx - center);
        const falloff = 1 - distance / center;
        const noise = 0.75 + Math.random() * 0.5;
        const target = Math.max(MIN_BAR_HEIGHT, base * (0.6 + 0.4 * falloff) * noise);
        sv.value = withTiming(target, { duration: 140 });
      });
    }, [volumeLevel, isActive, bars]);

    return (
      <View style={styles.waveformContainer}>
        {bars.map((sv, i) => {
          const style = useAnimatedStyle(() => ({ height: sv.value }));
          return <Animated.View key={i} style={[styles.waveformBar, style]} />;
        })}
      </View>
    );
  };

  // Handle enter animation once transcription group has mounted to measure target
  useEffect(() => {
    if (showTranscription) {
      // Ensure waveform starts hidden
      transcriptionOpacity.value = 0;
      waveformOpacity.value = 0;
      // Measure stop anchor and animate
      requestAnimationFrame(() => {
        measureRelativeToContainer(stopAnchorRef.current, (x) => {
          transcriptionOpacity.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.cubic) });
          waveformOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
          stopX.value = withTiming(x, { duration: 280, easing: Easing.out(Easing.cubic) });
          stopScale.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
          stopAlpha.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
        });
      });
    }
  }, [showTranscription, measureRelativeToContainer, transcriptionOpacity, waveformOpacity, stopX, stopScale, stopAlpha]);

  return (
    <View ref={containerRef} style={styles.container}>
      <Animated.View style={[{ flex: 1, flexDirection: "row", gap: theme.spacing.sm, alignItems: "center" }, defaultAnimatedStyle]}>
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
              Icon={Sparkles}
            />
          </View>
        </Animated.View>
      {showTranscription && (
        <Animated.View style={[{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, padding: theme.spacing.sm, flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }, transcriptionAnimatedStyle]} pointerEvents="none">
          <Animated.View style={[{ flex: 1, minWidth: 0 }, waveformStyle]}>
            <MiniWaveform volumeLevel={volumeLevel} isActive={isTranscriptionActive} />
          </Animated.View>
          {/* Invisible placeholder to compute final position and reserve space */}
          <View ref={stopAnchorRef} style={{ opacity: 0 }} pointerEvents="none">
            <RoundButton variant="red" onPress={() => {}} Icon={Square} disabled />
          </View>
        </Animated.View>
      )}
      {overlayVisible && (
        <Animated.View style={[{ position: "absolute", left: 0, top: theme.spacing.sm }, stopOverlayStyle]}>
          <RoundButton variant="red" onPress={handleStopPress} Icon={Square} />
        </Animated.View>
      )}
    </View>
  );
};
