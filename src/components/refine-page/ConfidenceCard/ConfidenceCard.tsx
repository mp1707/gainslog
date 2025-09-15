import React, { useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
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

  // Motion design constants to maintain coherent timing/curves across effects
  const MOTION = {
    // Primary ease for position/width changes (native-like decel)
    easeOut: Easing.bezier(0.18, 0.9, 0.2, 1),
    // Emphasized ease for highlights/pulses
    emphasized: Easing.bezier(0.2, 0.8, 0.2, 1),
    // Subtle ease for fades
    fade: Easing.out(Easing.quad),
  } as const;

  const clampedInitial = Math.max(0, Math.min(100, value || 0));
  const confidenceWidth = useSharedValue(clampedInitial);
  const colorProgress = useSharedValue(clampedInitial);
  const innerPulse = useSharedValue(0); // 0..1 strength for inner pulse overlay (inside fill)
  const glowPulse = useSharedValue(0); // 0..1 for glow intensity
  // Single loop clock to synchronize processing effects for smoother, lighter animation
  const loopT = useSharedValue(0); // 0..1 repeating
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
    const delta = Math.abs(target - prev);

    if (processing) {
      // During processing, keep things responsive; hide overlay
      overlayVisible.value = 0;
      overlayWidth.value = target;
      confidenceWidth.value = withTiming(target, {
        duration: 240,
        easing: MOTION.easeOut,
      });
      colorProgress.value = withTiming(target, {
        duration: 260,
        easing: MOTION.easeOut,
      });
    } else {
      // Ignore micro-changes to avoid visual noise
      if (delta < 2) {
        overlayVisible.value = 0;
        overlayWidth.value = target;
        confidenceWidth.value = withTiming(target, {
          duration: 220,
          easing: MOTION.easeOut,
        });
        colorProgress.value = withTiming(target, {
          duration: 320,
          easing: MOTION.easeOut,
        });
        didJustStopProcessing.current = false;
      } else if (target > prev) {
        // Increase: show accent overlay for the delta first, then main bar follows
        overlayWidth.value = prev;
        overlayVisible.value = 1;

        // Expand overlay quickly from prev -> target
        overlayWidth.value = withTiming(target, {
          duration: 240,
          easing: MOTION.emphasized,
        });

        // Main bar follows with a slight delay for the "reverse hit" effect
        confidenceWidth.value = withDelay(
          300,
          withTiming(target, {
            duration: 600,
            easing: MOTION.easeOut,
          })
        );

        // Color also glides with a small delay
        colorProgress.value = withDelay(
          260,
          withTiming(target, {
            duration: 640,
            easing: MOTION.easeOut,
          })
        );

        // Trigger rush pulse effect when loading stops and value increases
        if (didJustStopProcessing.current) {
          // Stronger haptic feedback for completion with improvement
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          rushPulse.value = 0;
          rushPulse.value = withTiming(1, {
            duration: 320,
            easing: MOTION.emphasized,
          });
          rushPulse.value = withDelay(
            340,
            withTiming(0, { duration: 420, easing: MOTION.fade })
          );
        }

        // Fade the overlay after the base has caught up
        overlayVisible.value = withDelay(
          820,
          withTiming(0, { duration: 240, easing: MOTION.fade })
        );
      } else {
        // Decrease or equal: default smooth settle, no overlay
        overlayVisible.value = 0;
        overlayWidth.value = target;
        confidenceWidth.value = withTiming(target, {
          duration: 420,
          easing: MOTION.easeOut,
        });
        // Light haptic feedback for completion without increase
        if (didJustStopProcessing.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        const duration = didJustStopProcessing.current ? 600 : 420;
        colorProgress.value = withTiming(target, {
          duration,
          easing: MOTION.easeOut,
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

      // One synchronized loop drives shimmer, big glow, and pulses
      loopT.value = 0;
      loopT.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.linear }),
        -1,
        true
      );

      // Derive individual effects from loopT for subtle, cohesive motion
      // Shimmer marches steadily L->R; Big glow eases in/out more slowly
      shimmerX.value = -100; // initial off-screen
      bigGlowX.value = -200;
      bigGlowOpacity.value = 0;

      // Pulses keyed to loopT for a soft breathing feel
      innerPulse.value = withRepeat(
        withTiming(1, { duration: 900, easing: MOTION.emphasized }),
        -1,
        true
      );
      glowPulse.value = withRepeat(
        withTiming(1, { duration: 1200, easing: MOTION.emphasized }),
        -1,
        true
      );
    } else {
      // Stop all animations and ease out effects
      didJustStopProcessing.current = true;
      cancelAnimation(loopT);
      cancelAnimation(shimmerX);
      cancelAnimation(bigGlowX);
      cancelAnimation(bigGlowOpacity);
      shimmerX.value = -100;
      bigGlowX.value = -200;
      bigGlowOpacity.value = withTiming(0, {
        duration: 180,
        easing: MOTION.fade,
      });
      innerPulse.value = withTiming(0, { duration: 220, easing: MOTION.fade });
      glowPulse.value = withTiming(0, { duration: 300, easing: MOTION.fade });
    }
    // Cleanup on unmount to avoid stray loops
    return () => {
      cancelAnimation(loopT);
      cancelAnimation(shimmerX);
      cancelAnimation(bigGlowX);
      cancelAnimation(bigGlowOpacity);
      cancelAnimation(innerPulse);
      cancelAnimation(glowPulse);
    };
  }, [
    processing,
    shimmerX,
    innerPulse,
    glowPulse,
    bigGlowX,
    bigGlowOpacity,
    loopT,
  ]);

  // Enhanced celebration on reveal (after successful refine)
  useEffect(() => {
    if (reveal) {
      // Celebration haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Brief width bounce via scaleY applied to fill
      innerPulse.value = 1;
      innerPulse.value = withTiming(0, {
        duration: 520,
        easing: MOTION.fade,
      });
      // Give glow a quick highlight
      glowPulse.value = 1;
      glowPulse.value = withTiming(0, {
        duration: 520,
        easing: MOTION.fade,
      });
      // Add rush pulse for celebration effect
      rushPulse.value = 0;
      rushPulse.value = withTiming(1, {
        duration: 360,
        easing: MOTION.emphasized,
      });
      rushPulse.value = withDelay(
        360,
        withTiming(0, { duration: 420, easing: MOTION.fade })
      );
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
    const scaleY = 1 + innerPulse.value * 0.12 + rushPulse.value * 0.08; // subtle, refined
    // Subtler glow intensity follows glowPulse and processing state
    const glowStrength = processing
      ? 0.4 + glowPulse.value * 0.6
      : glowPulse.value * 0.15 + rushPulse.value * 0.6;
    const shadowRadius = 4 + glowStrength * 10;
    const shadowOpacity = 0.15 + glowStrength * 0.25;
    const elevation = processing ? 6 : rushPulse.value * 6;
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
  const shimmerStyle = useAnimatedStyle(() => {
    // Map loop to shimmer travel. Keep steady, subtle shine
    const x = interpolate(loopT.value, [0, 1], [-100, 300]);
    return {
      transform: [{ translateX: processing ? x : shimmerX.value }],
      opacity: processing ? 0.6 : 0,
    };
  });

  // Big dramatic glow effect
  const bigGlowStyle = useAnimatedStyle(() => {
    // Slow sweep, very soft and occasional feeling via loopT shaping
    const x = interpolate(loopT.value, [0, 1], [-200, 400]);
    const o = interpolate(loopT.value, [0, 0.5, 1], [0, 0.25, 0]);
    return {
      transform: [{ translateX: processing ? x : bigGlowX.value }],
      opacity: o,
    };
  });

  // Rush pulse effect that travels left to right when loading finishes
  const rushPulseStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rushPulse.value * 400 - 200 }],
    opacity: rushPulse.value * 0.5,
  }));

  const innerPulseOverlayStyle = useAnimatedStyle(() => ({
    opacity: processing
      ? 0.18 + innerPulse.value * 0.28
      : innerPulse.value * 0.25 + rushPulse.value * 0.3,
  }));

  // Overlay for increases only – draws the new segment first
  const increaseOverlayStyle = useAnimatedStyle(() => ({
    left: 0,
    width: `${Math.max(0, Math.min(100, overlayWidth.value))}%`,
    opacity: overlayVisible.value * (0.85 + rushPulse.value * 0.35),
    backgroundColor: colors.accent,
    // Add subtle glow to the overlay during rush
    shadowColor: colors.accent,
    shadowOpacity: Platform.OS === "ios" ? rushPulse.value * 0.3 : 0,
    shadowRadius: Platform.OS === "ios" ? rushPulse.value * 12 : 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: Platform.OS === "android" ? rushPulse.value * 4 : 0,
  }));

  return (
    <Card>
      <AppText role="Caption" style={styles.sectionHeader}>
        ESTIMATION CONFIDENCE
      </AppText>
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
                  `${colors.white}12`,
                  `${colors.white}66`,
                  `${colors.white}12`,
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
                  `${colors.accent}40`,
                  `${colors.accent}C0`,
                  `${colors.accent}40`,
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
