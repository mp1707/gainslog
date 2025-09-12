import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withTiming, cancelAnimation, withSpring } from 'react-native-reanimated';
import { AppText } from '@/components';
import { useTheme } from '@/theme';
import { createStyles } from './ConfidenceCard.styles';
import { LinearGradient } from 'expo-linear-gradient';

interface ConfidenceCardProps {
  value: number; // 0-100
  // When true, show shimmering scan to indicate processing
  processing?: boolean;
  // When true, apply a subtle bounce/pulse on settle
  reveal?: boolean;
}

const getConfidenceLabel = (value: number) => {
  if (value >= 90) return 'High Accuracy';
  if (value >= 50) return 'Medium Accuracy';
  if (value > 0) return 'Low Accuracy';
  return 'Uncertain';
};

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({ value, processing = false, reveal = false }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const clampedInitial = Math.max(0, Math.min(100, value || 0));
  const confidenceWidth = useSharedValue(clampedInitial);
  const colorProgress = useSharedValue(clampedInitial);
  const innerPulse = useSharedValue(0); // 0..1 opacity for inner pulse overlay (inside fill)
  const glowPulse = useSharedValue(0); // 0..1 for glow intensity
  const shimmerX = useSharedValue(-100);
  const didJustStopProcessing = useRef(false);

  useEffect(() => {
    const target = Math.max(0, Math.min(100, value || 0));
    // Animate the fill width with a spring for a lively settle
    confidenceWidth.value = withSpring(target, {
      damping: 18,
      stiffness: 160,
      mass: 0.8,
      overshootClamping: false,
    });
    // Color transitions:
    // - While processing: snap color quickly to keep bar responsive
    // - After processing finishes: animate smoothly to draw attention
    if (processing) {
      colorProgress.value = withTiming(target, { duration: 250, easing: Easing.out(Easing.quad) });
    } else {
      // If we just stopped processing, give the color a longer, smooth glide
      const duration = didJustStopProcessing.current ? 700 : 450;
      colorProgress.value = withTiming(target, { duration, easing: Easing.out(Easing.cubic) });
      didJustStopProcessing.current = false;
    }
  }, [value, processing, confidenceWidth, colorProgress]);

  // Start/stop shimmer during processing
  useEffect(() => {
    if (processing) {
      // Shimmer runs across the fill; inner pulse and glow intensify
      shimmerX.value = withRepeat(withTiming(300, { duration: 1100, easing: Easing.linear }), -1, false);
      innerPulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true);
      glowPulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else {
      // Stop shimmer and ease out pulse/glow
      didJustStopProcessing.current = true;
      cancelAnimation(shimmerX);
      shimmerX.value = -100;
      innerPulse.value = withTiming(0, { duration: 250 });
      glowPulse.value = withTiming(0, { duration: 350 });
    }
  }, [processing, shimmerX, innerPulse, glowPulse]);

  // Subtle bounce on reveal (after successful refine)
  useEffect(() => {
    if (reveal) {
      // Brief width bounce via scaleY applied to fill
      innerPulse.value = 1;
      innerPulse.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) });
      // Give glow a quick highlight
      glowPulse.value = 1;
      glowPulse.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) });
    }
  }, [reveal, innerPulse, glowPulse]);

  const confidenceBarStyle = useAnimatedStyle(() => {
    const clampedWidth = Math.max(0, Math.min(100, confidenceWidth.value));
    const clampedColor = Math.max(0, Math.min(100, colorProgress.value));
    // Smooth red -> yellow -> green across 0..100
    const bg = interpolateColor(
      clampedColor,
      [0, 50, 100],
      [colors.error, colors.warning, colors.success]
    );
    // Slight height pulse contained within the fill
    const scaleY = 1 + innerPulse.value * 0.18;
    // Glow intensity follows glowPulse and processing state
    const glowStrength = processing ? 0.7 + glowPulse.value * 0.5 : glowPulse.value * 0.25;
    const shadowRadius = 6 + glowStrength * 16;
    const shadowOpacity = 0.28 + glowStrength * 0.5;
    const elevation = processing ? 10 : 0;
    return {
      width: `${clampedWidth}%`,
      backgroundColor: bg as string,
      transform: [{ scaleY }],
      // Glow/shadow to make the bar pop during loading
      shadowColor: bg as string,
      shadowOpacity: Platform.OS === 'ios' ? shadowOpacity : 0,
      shadowRadius: Platform.OS === 'ios' ? shadowRadius : 0,
      shadowOffset: { width: 0, height: 2 },
      elevation: Platform.OS === 'android' ? elevation : 0,
    };
  });

  // Shimmer scan now runs INSIDE the filled bar to emphasize progress
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
    opacity: processing ? 0.85 : 0,
  }));

  const innerPulseOverlayStyle = useAnimatedStyle(() => ({
    opacity: processing ? 0.15 + innerPulse.value * 0.35 : innerPulse.value * 0.25,
  }));

  return (
    <View style={styles.card}>
      <View style={styles.confidenceHeader}>
        <AppText role="Headline">Estimation Accuracy</AppText>
        <AppText role="Subhead" color="secondary">
          {value ?? 0}% • {getConfidenceLabel(value ?? 0)}
        </AppText>
      </View>
      <View style={styles.meterTrack}>
        <Animated.View style={[styles.meterFill, confidenceBarStyle]}>
          {/* Inner pulse overlay contained by the fill */}
          <Animated.View style={[styles.innerPulseOverlay, innerPulseOverlayStyle]} />
          {/* Shimmer scan overlay while processing – now clipped inside the fill */}
          {processing && (
            <Animated.View pointerEvents="none" style={[styles.shimmerOverlay, shimmerStyle]}> 
              <LinearGradient
                colors={[`${colors.white}00`, `${colors.white}66`, `${colors.white}00`]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};
