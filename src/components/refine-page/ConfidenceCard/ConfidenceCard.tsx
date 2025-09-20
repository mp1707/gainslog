import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { LayoutChangeEvent, Platform, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Check, Sparkles } from "lucide-react-native";

import { Card, AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./ConfidenceCard.styles";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type ConfidenceLevel = 0 | 1 | 2 | 3;

type ConfidenceCardProps = {
  confidenceLevel: ConfidenceLevel;
  infoSubText?: string;
  isLoading?: boolean;
};

type TimeoutHandle = ReturnType<typeof setTimeout>;

const clampConfidenceLevel = (value: number): ConfidenceLevel => {
  if (value <= 0) return 0;
  if (value >= 3) return 3;
  return value as ConfidenceLevel;
};

const HEADLINE_COPY: Record<
  ConfidenceLevel,
  { title: string; loadingTitle: string; highlight?: boolean }
> = {
  0: {
    title: "Estimation Pending",
    loadingTitle: "Calibrating confidence",
  },
  1: {
    title: "Broad Estimation",
    loadingTitle: "Tightening estimation",
  },
  2: {
    title: "Good Estimation",
    loadingTitle: "Refining details",
  },
  3: {
    title: "Detailed Estimation",
    loadingTitle: "Refining details",
    highlight: true,
  },
};

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  confidenceLevel,
  infoSubText,
  isLoading = false,
}) => {
  const sanitizedLevel = clampConfidenceLevel(confidenceLevel);

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const barOne = useSharedValue(sanitizedLevel > 0 ? 1 : 0);
  const barTwo = useSharedValue(sanitizedLevel > 1 ? 1 : 0);
  const barThree = useSharedValue(sanitizedLevel > 2 ? 1 : 0);

  const snapshotOne = useSharedValue(0);
  const snapshotTwo = useSharedValue(0);
  const snapshotThree = useSharedValue(0);
  const animatedSnapshotOne = useSharedValue(0);
  const animatedSnapshotTwo = useSharedValue(0);
  const animatedSnapshotThree = useSharedValue(0);

  const bars = useMemo(
    () => [barOne, barTwo, barThree] as const,
    [barOne, barTwo, barThree]
  );
  const barSnapshots = useMemo(
    () => [snapshotOne, snapshotTwo, snapshotThree] as const,
    [snapshotOne, snapshotTwo, snapshotThree]
  );
  const barAnimatedSnapshots = useMemo(
    () =>
      [
        animatedSnapshotOne,
        animatedSnapshotTwo,
        animatedSnapshotThree,
      ] as const,
    [animatedSnapshotOne, animatedSnapshotTwo, animatedSnapshotThree]
  );

  const barWidth = useSharedValue(0);
  const isLoadingShared = useSharedValue(isLoading ? 1 : 0);
  const loadingLoop = useSharedValue(0);
  const loadingPulse = useSharedValue(0);
  const infoOpacity = useSharedValue(isLoading ? 0.35 : 1);

  const previousLevelRef = useRef<ConfidenceLevel>(sanitizedLevel);
  const previousLoadingRef = useRef<boolean>(!!isLoading);
  const hasInitializedRef = useRef(false);
  const scheduledHapticsRef = useRef<TimeoutHandle[]>([]);
  const previousInfoRef = useRef<string | undefined>(infoSubText);

  const headline = HEADLINE_COPY[sanitizedLevel];
  // const displayTitle = isLoading ? headline.loadingTitle : headline.title;
  const displayTitle = headline.title;

  const clearScheduledHaptics = useCallback(() => {
    scheduledHapticsRef.current.forEach(clearTimeout);
    scheduledHapticsRef.current = [];
  }, []);

  const scheduleHaptic = useCallback((delay: number) => {
    const timeout = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
        () => undefined
      );
    }, delay);
    scheduledHapticsRef.current.push(timeout);
  }, []);

  const animateToLevel = useCallback(
    (from: ConfidenceLevel, to: ConfidenceLevel, fromLoading: boolean) => {
      clearScheduledHaptics();

      const baseDelay = fromLoading ? 120 : 80;
      const duration = fromLoading ? 520 : 420;
      const stepGap = fromLoading ? duration : Math.max(240, duration - 120);

      bars.forEach((progress, index) => {
        cancelAnimation(progress);
        const shouldFill = index < to;
        const wasFilled = index < from;
        const delay = baseDelay + index * stepGap;
        const snapshot = barSnapshots[index];
        const animatedSnapshot = barAnimatedSnapshots[index];

        if (shouldFill) {
          if (!wasFilled && fromLoading) {
            const snapshotValue = snapshot.value;
            const current = progress.value;
            progress.value = Math.max(current, snapshotValue * 0.92);
          }
          progress.value = withDelay(
            delay,
            withTiming(1, {
              duration,
              easing: Easing.out(Easing.cubic),
            })
          );
          animatedSnapshot.value = withDelay(
            Math.max(0, delay - 40),
            withTiming(0, {
              duration: Math.max(200, duration * 0.5),
              easing: Easing.out(Easing.cubic),
            })
          );
        } else {
          if (fromLoading) {
            const snapshotValue = snapshot.value;
            const current = progress.value;
            progress.value = Math.max(current, snapshotValue * 0.6);
          }
          const releaseDelay = baseDelay + index * 120;
          progress.value = withDelay(
            releaseDelay,
            withTiming(0, {
              duration: 360,
              easing: Easing.out(Easing.cubic),
            })
          );
        }
      });

      if (to > from) {
        for (let levelIndex = from; levelIndex < to; levelIndex += 1) {
          const levelOffset = levelIndex - from;
          const delay = baseDelay + levelOffset * stepGap + duration * 0.85;
          scheduleHaptic(delay);
        }
      }
    },
    [bars, barSnapshots, clearScheduledHaptics, scheduleHaptic]
  );

  const onTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      if (width > 0) {
        barWidth.value = width;
      }
    },
    [barWidth]
  );

  useEffect(() => {
    if (!hasInitializedRef.current && !isLoading) {
      bars.forEach((progress, index) => {
        progress.value = index < sanitizedLevel ? 1 : 0;
      });
      previousLevelRef.current = sanitizedLevel;
      hasInitializedRef.current = true;
    }
  }, [bars, sanitizedLevel, isLoading]);

  useEffect(() => {
    barAnimatedSnapshots.forEach((animatedSnapshot, index) => {
      const shouldAnimate = isLoading && index === sanitizedLevel;
      animatedSnapshot.value = withTiming(shouldAnimate ? 1 : 0, {
        duration: shouldAnimate ? 200 : 280,
        easing: Easing.out(Easing.cubic),
      });
    });
  }, [barAnimatedSnapshots, isLoading, sanitizedLevel]);

  useEffect(() => {
    isLoadingShared.value = withTiming(isLoading ? 1 : 0, {
      duration: isLoading ? 180 : 260,
      easing: Easing.out(Easing.quad),
    });

    if (isLoading) {
      clearScheduledHaptics();
      loadingLoop.value = 0;
      loadingPulse.value = 0;
      loadingLoop.value = withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.linear }),
        -1,
        false
      );
      loadingPulse.value = withRepeat(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      cancelAnimation(loadingLoop);
      cancelAnimation(loadingPulse);
      loadingLoop.value = 0;
      loadingPulse.value = withTiming(0, {
        duration: 260,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [
    isLoading,
    isLoadingShared,
    loadingLoop,
    loadingPulse,
    clearScheduledHaptics,
  ]);

  useEffect(() => {
    const targetLevel = sanitizedLevel;
    const previousLevel = previousLevelRef.current;
    const wasLoading = previousLoadingRef.current;

    if (!isLoading && (wasLoading || targetLevel !== previousLevel)) {
      animateToLevel(previousLevel, targetLevel, wasLoading);
      previousLevelRef.current = targetLevel;
    }

    previousLoadingRef.current = isLoading;
  }, [animateToLevel, sanitizedLevel, isLoading]);

  useEffect(() => {
    infoOpacity.value = withTiming(isLoading ? 0.4 : 1, {
      duration: isLoading ? 180 : 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [isLoading, infoOpacity]);

  useEffect(() => {
    if (infoSubText !== previousInfoRef.current && !isLoading && infoSubText) {
      infoOpacity.value = 0;
      infoOpacity.value = withDelay(
        80,
        withTiming(1, {
          duration: 320,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
    previousInfoRef.current = infoSubText;
  }, [infoSubText, isLoading, infoOpacity]);

  useEffect(
    () => () => {
      clearScheduledHaptics();
      cancelAnimation(loadingLoop);
      cancelAnimation(loadingPulse);
      bars.forEach((progress) => {
        cancelAnimation(progress);
      });
    },
    [clearScheduledHaptics, loadingLoop, loadingPulse, bars]
  );

  const barAnimatedStyles = bars.map((progress, index) =>
    useAnimatedStyle(() => {
      const measuredWidth = barWidth.value || 0;
      const isLoadingValue = isLoadingShared.value;
      const progressValue = Math.min(Math.max(progress.value, 0), 1);
      const isNextAnimated = sanitizedLevel === index;
      const willRemainFilled = sanitizedLevel > index;

      const wave = Math.sin((loadingLoop.value + index * 0.35) * Math.PI * 2);
      const snapshot = barSnapshots[index];
      const shouldBlendLoading =
        isNextAnimated &&
        isLoadingValue > 0.001 &&
        (isLoading || willRemainFilled);
      const loadingRatio = shouldBlendLoading
        ? 0.18 + 0.18 * ((wave + 1) / 2)
        : snapshot.value;
      if (shouldBlendLoading) {
        snapshot.value = loadingRatio;
      }

      const animatedSnapshot = barAnimatedSnapshots[index];
      const snapshotBlend = Math.max(0, Math.min(1, animatedSnapshot.value));
      const blendedLoadingRatio = loadingRatio * snapshotBlend;

      const filledWidth = measuredWidth * progressValue;
      let width = filledWidth;
      if (shouldBlendLoading) {
        const loadingWidth = measuredWidth * blendedLoadingRatio;
        width = filledWidth + (loadingWidth - filledWidth) * isLoadingValue;
      }

      const loadingScale = 1 + 0.12 * ((wave + 1) / 2);
      const restingScale = 1 + 0.05 * progressValue;
      let scaleY = restingScale;
      if (shouldBlendLoading) {
        const blendedLoadingScale = 1 + (loadingScale - 1) * snapshotBlend;
        scaleY =
          restingScale + (blendedLoadingScale - restingScale) * isLoadingValue;
      }

      const loadingOpacity = 0.75 + 0.2 * ((wave + 1) / 2);
      const restingOpacity = 0.88 + 0.12 * progressValue;
      let opacity = restingOpacity;
      if (shouldBlendLoading) {
        const blendedLoadingOpacity =
          0.5 + (loadingOpacity - 0.5) * snapshotBlend;
        opacity =
          restingOpacity +
          (blendedLoadingOpacity - restingOpacity) * isLoadingValue;
      }

      const loadingGlow = 0.4 + 0.4 * ((loadingPulse.value + wave + 1) / 3);
      const restingGlow = 0.2 + 0.35 * progressValue;
      let glow = restingGlow;
      if (shouldBlendLoading) {
        const blendedLoadingGlow = loadingGlow * snapshotBlend;
        glow =
          restingGlow + (blendedLoadingGlow - restingGlow) * isLoadingValue;
      }

      return {
        width,
        opacity,
        transform: [{ scaleY }],
        shadowColor: colors.accent,
        shadowOpacity: Platform.OS === "ios" ? glow : 0,
        shadowRadius: Platform.OS === "ios" ? 6 + glow * 8 : 0,
        shadowOffset: { width: 0, height: 2 },
        elevation: Platform.OS === "android" ? glow * 8 : 0,
      };
    })
  );

  const barGlowStyles = bars.map((progress, index) =>
    useAnimatedStyle(() => {
      const progressValue = Math.min(Math.max(progress.value, 0), 1);
      const isLoadingValue = isLoadingShared.value;
      const wave = Math.sin((loadingLoop.value + index * 0.35) * Math.PI * 2);
      const isNextAnimated = sanitizedLevel === index;
      const willRemainFilled = sanitizedLevel > index;

      const shouldBlendLoading =
        isNextAnimated &&
        isLoadingValue > 0.001 &&
        (isLoading || willRemainFilled);

      const animatedSnapshot = barAnimatedSnapshots[index];
      const snapshotBlend = Math.max(0, Math.min(1, animatedSnapshot.value));

      const loadingGlowOpacity = shouldBlendLoading
        ? 0.25 + 0.35 * ((loadingPulse.value + 1 + wave) / 3)
        : 0;
      const restingGlowOpacity = 0.1 + 0.25 * progressValue;
      const blendedLoadingGlowOpacity = loadingGlowOpacity * snapshotBlend;
      let opacity = restingGlowOpacity;
      if (shouldBlendLoading) {
        opacity =
          restingGlowOpacity +
          (blendedLoadingGlowOpacity - restingGlowOpacity) * isLoadingValue;
      }

      return { opacity };
    })
  );

  const barShimmerStyles = bars.map((_, index) =>
    useAnimatedStyle(() => {
      const measuredWidth = barWidth.value || 0;
      const isTarget = sanitizedLevel === index;
      if (!isTarget) {
        return { opacity: 0 };
      }

      const travel = measuredWidth * 1.8;
      const translateX = loadingLoop.value * travel - travel * 0.4;

      return {
        opacity: isLoadingShared.value * 0.45,
        transform: [{ translateX }],
        width: measuredWidth * 1.2,
      };
    })
  );

  const infoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: infoOpacity.value,
    transform: [{ translateY: (1 - infoOpacity.value) * 6 }],
  }));

  return (
    <Card style={styles.card}>
      <AppText role="Caption" style={styles.sectionLabel}>
        ESTIMATION CONFIDENCE
      </AppText>
      <View style={styles.titleRow}>
        <AppText
          role="Headline"
          style={[
            styles.titleText,
            headline.highlight && !isLoading ? { color: colors.accent } : null,
          ]}
        >
          {displayTitle}
        </AppText>
      </View>
      <View style={styles.barsRow}>
        <View style={styles.barsContainer}>
          {bars.map((progress, index) => (
            <View
              key={`bar-${index}`}
              style={[
                styles.barTrack,
                index !== bars.length - 1 ? styles.barTrackSpacing : null,
              ]}
              onLayout={index === 0 ? onTrackLayout : undefined}
            >
              <Animated.View
                pointerEvents="none"
                style={[styles.barGlow, barGlowStyles[index]]}
              />
              <Animated.View
                pointerEvents="none"
                style={[styles.barFill, barAnimatedStyles[index]]}
              />
              {isLoading ? (
                <AnimatedLinearGradient
                  pointerEvents="none"
                  colors={[
                    `${colors.white}00`,
                    `${colors.accent}33`,
                    `${colors.white}00`,
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.barShimmer, barShimmerStyles[index]]}
                />
              ) : null}
            </View>
          ))}
        </View>
      </View>
      {infoSubText ? (
        <Animated.View style={[styles.infoContainer, infoAnimatedStyle]}>
          <View style={styles.infoPill}>
            <Sparkles
              size={14}
              color={colors.secondaryText}
              style={styles.infoIconSpacing}
            />
            <AppText role="Caption" style={styles.infoText}>
              {infoSubText}
            </AppText>
          </View>
        </Animated.View>
      ) : null}
    </Card>
  );
};
