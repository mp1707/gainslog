import React, { useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AppText, Card } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./ConfidenceCard.styles";
import { LinearGradient } from "expo-linear-gradient";

interface ConfidenceCardProps {
  value: number; // 0-100
  // When true, show shimmering scan to indicate processing
  processing?: boolean;
  // When true, apply a subtle bounce/pulse on settle
  reveal?: boolean;
}

const getConfidenceLabel = (value: number) => {
  if (value >= 90) return "High Accuracy";
  if (value >= 50) return "Medium Accuracy";
  if (value > 0) return "Low Accuracy";
  return "Uncertain";
};

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  value,
  processing = false,
  reveal = false,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const clampedInitial = Math.max(0, Math.min(100, value || 0));
  const confidenceWidth = useSharedValue(clampedInitial);
  const colorProgress = useSharedValue(clampedInitial);
  const innerPulse = useSharedValue(0); // 0..1 opacity for inner pulse overlay (inside fill)
  const glowPulse = useSharedValue(0); // 0..1 for glow intensity
  const shimmerX = useSharedValue(-100);
  const bigGlowX = useSharedValue(-200); // Big traveling glow effect
  const bigGlowOpacity = useSharedValue(0); // Big glow visibility
  const rushPulse = useSharedValue(0); // Final rush effect when loading completes
  const didJustStopProcessing = useRef(false);
  const prevValueRef = useRef(clampedInitial);
  // Overlay for increase animation (behind main fill)
  const overlayVisible = useSharedValue(0); // opacity 0..1
  const overlayWidth = useSharedValue(clampedInitial); // 0..100

  useEffect(() => {
    const target = Math.max(0, Math.min(100, value || 0));
    const prev = Math.max(0, Math.min(100, prevValueRef.current));

    if (processing) {
      // During processing, keep things responsive; hide overlay
      overlayVisible.value = 0;
      overlayWidth.value = target;
      confidenceWidth.value = withTiming(target, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
      colorProgress.value = withTiming(target, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
    } else {
      if (target > prev) {
        // Increase: show accent overlay for the delta first, then main bar follows
        overlayWidth.value = prev;
        overlayVisible.value = 1;

        // Expand overlay quickly from prev -> target
        overlayWidth.value = withTiming(target, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });

        // Main bar follows with a slight delay for the "reverse hit" effect
        confidenceWidth.value = withDelay(
          320,
          withSpring(target, {
            damping: 18,
            stiffness: 160,
            mass: 0.8,
            overshootClamping: false,
          })
        );

        // Color also glides with a small delay
        colorProgress.value = withDelay(
          280,
          withTiming(target, {
            duration: 550,
            easing: Easing.out(Easing.cubic),
          })
        );

        // Trigger rush pulse effect when loading stops and value increases
        if (didJustStopProcessing.current) {
          // Stronger haptic feedback for completion with improvement
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          rushPulse.value = 0;
          rushPulse.value = withTiming(1, {
            duration: 350,
            easing: Easing.out(Easing.cubic),
          });
          rushPulse.value = withDelay(380, withTiming(0, { duration: 250 }));
        }

        // Fade the overlay after the base has caught up
        overlayVisible.value = withDelay(720, withTiming(0, { duration: 250 }));
      } else {
        // Decrease or equal: default smooth settle, no overlay
        overlayVisible.value = 0;
        overlayWidth.value = target;
        confidenceWidth.value = withSpring(target, {
          damping: 18,
          stiffness: 160,
          mass: 0.8,
          overshootClamping: false,
        });
        // Light haptic feedback for completion without increase
        if (didJustStopProcessing.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        const duration = didJustStopProcessing.current ? 700 : 450;
        colorProgress.value = withTiming(target, {
          duration,
          easing: Easing.out(Easing.cubic),
        });
        didJustStopProcessing.current = false;
      }
    }

    prevValueRef.current = target;
  }, [
    value,
    processing,
    confidenceWidth,
    colorProgress,
    overlayVisible,
    overlayWidth,
    rushPulse,
  ]);

  // Start/stop shimmer and big glow during processing
  useEffect(() => {
    if (processing) {
      // Subtle haptic feedback when processing starts
      Haptics.selectionAsync();

      // Original shimmer runs across the fill
      shimmerX.value = withRepeat(
        withTiming(300, { duration: 1100, easing: Easing.linear }),
        -1,
        false
      );

      // Big dramatic glow that sweeps left to right
      bigGlowX.value = withRepeat(
        withTiming(400, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        -1,
        false
      );
      bigGlowOpacity.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );

      // Intensified pulse and glow
      innerPulse.value = withRepeat(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      glowPulse.value = withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      // Stop all animations and ease out effects
      didJustStopProcessing.current = true;
      cancelAnimation(shimmerX);
      cancelAnimation(bigGlowX);
      cancelAnimation(bigGlowOpacity);
      shimmerX.value = -100;
      bigGlowX.value = -200;
      bigGlowOpacity.value = withTiming(0, { duration: 200 });
      innerPulse.value = withTiming(0, { duration: 250 });
      glowPulse.value = withTiming(0, { duration: 350 });
    }
  }, [processing, shimmerX, innerPulse, glowPulse, bigGlowX, bigGlowOpacity]);

  // Enhanced celebration on reveal (after successful refine)
  useEffect(() => {
    if (reveal) {
      // Celebration haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Brief width bounce via scaleY applied to fill
      innerPulse.value = 1;
      innerPulse.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
      // Give glow a quick highlight
      glowPulse.value = 1;
      glowPulse.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
      // Add rush pulse for celebration effect
      rushPulse.value = 0;
      rushPulse.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      rushPulse.value = withDelay(450, withTiming(0, { duration: 350 }));
    }
  }, [reveal, innerPulse, glowPulse, rushPulse]);

  const confidenceBarStyle = useAnimatedStyle(() => {
    const clampedWidth = Math.max(0, Math.min(100, confidenceWidth.value));
    const clampedColor = Math.max(0, Math.min(100, colorProgress.value));
    // Smooth red -> yellow -> green across 0..100
    const bg = interpolateColor(
      clampedColor,
      [0, 50, 100],
      [colors.error, colors.warning, colors.success]
    );
    // Enhanced height pulse contained within the fill
    const scaleY = 1 + innerPulse.value * 0.3 + rushPulse.value * 0.15;
    // Enhanced glow intensity follows glowPulse and processing state
    const glowStrength = processing
      ? 1.2 + glowPulse.value * 1.5
      : glowPulse.value * 0.25 + rushPulse.value * 1.8;
    const shadowRadius = 8 + glowStrength * 24;
    const shadowOpacity = 0.35 + glowStrength * 0.65;
    const elevation = processing ? 15 : rushPulse.value * 12;
    return {
      width: `${clampedWidth}%`,
      backgroundColor: bg as string,
      transform: [{ scaleY }],
      // Glow/shadow to make the bar pop during loading
      shadowColor: bg as string,
      shadowOpacity: Platform.OS === "ios" ? shadowOpacity : 0,
      shadowRadius: Platform.OS === "ios" ? shadowRadius : 0,
      shadowOffset: { width: 0, height: 2 },
      elevation: Platform.OS === "android" ? elevation : 0,
    };
  });

  // Shimmer scan now runs INSIDE the filled bar to emphasize progress
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
    opacity: processing ? 0.85 : 0,
  }));

  // Big dramatic glow effect
  const bigGlowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bigGlowX.value }],
    opacity: bigGlowOpacity.value * 0.9,
  }));

  // Rush pulse effect that travels left to right when loading finishes
  const rushPulseStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rushPulse.value * 400 - 200 }],
    opacity: rushPulse.value * 0.8,
  }));

  const innerPulseOverlayStyle = useAnimatedStyle(() => ({
    opacity: processing
      ? 0.25 + innerPulse.value * 0.5
      : innerPulse.value * 0.35 + rushPulse.value * 0.4,
  }));

  // Overlay for increases only – draws the new segment first
  const increaseOverlayStyle = useAnimatedStyle(() => ({
    left: 0,
    width: `${Math.max(0, Math.min(100, overlayWidth.value))}%`,
    opacity: overlayVisible.value * (1 + rushPulse.value * 0.5),
    backgroundColor: colors.accent,
    // Add subtle glow to the overlay during rush
    shadowColor: colors.accent,
    shadowOpacity: Platform.OS === "ios" ? rushPulse.value * 0.6 : 0,
    shadowRadius: Platform.OS === "ios" ? rushPulse.value * 20 : 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: Platform.OS === "android" ? rushPulse.value * 8 : 0,
  }));

  return (
    <Card>
      <View style={styles.batteryInfoLayout}>
        <AppText role="Title2" style={styles.percentageText}>
          {value ?? 0}%
        </AppText>
        <AppText role="Subhead" color="secondary">
          {getConfidenceLabel(value ?? 0)}
        </AppText>
      </View>
      <View style={styles.meterTrack}>
        {/* Accent overlay for increase animation (behind main fill) */}
        <Animated.View
          pointerEvents="none"
          style={[styles.increaseOverlay, increaseOverlayStyle]}
        />
        <Animated.View style={[styles.meterFill, confidenceBarStyle]}>
          {/* Inner pulse overlay contained by the fill */}
          <Animated.View
            style={[styles.innerPulseOverlay, innerPulseOverlayStyle]}
          />

          {/* Big dramatic glow effect during processing */}
          {processing && (
            <Animated.View
              pointerEvents="none"
              style={[styles.bigGlowOverlay, bigGlowStyle]}
            >
              <LinearGradient
                colors={[
                  `${colors.white}00`,
                  `${colors.white}20`,
                  `${colors.white}90`,
                  `${colors.white}20`,
                  `${colors.white}00`,
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.bigGlowGradient}
              />
            </Animated.View>
          )}

          {/* Rush pulse effect when loading finishes */}
          {!processing && (
            <Animated.View
              pointerEvents="none"
              style={[styles.rushPulseOverlay, rushPulseStyle]}
            >
              <LinearGradient
                colors={[
                  `${colors.accent}00`,
                  `${colors.accent}80`,
                  `${colors.accent}FF`,
                  `${colors.accent}80`,
                  `${colors.accent}00`,
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.rushPulseGradient}
              />
            </Animated.View>
          )}

          {/* Original shimmer scan overlay while processing – now clipped inside the fill */}
          {processing && (
            <Animated.View
              pointerEvents="none"
              style={[styles.shimmerOverlay, shimmerStyle]}
            >
              <LinearGradient
                colors={[
                  `${colors.white}00`,
                  `${colors.white}66`,
                  `${colors.white}00`,
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Card>
  );
};
