import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import * as Haptics from "expo-haptics";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(theme);

  // Create array of segments
  const segments = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.segmentsContainer}>
        {segments.map((step) => (
          <ProgressSegment
            key={step}
            step={step}
            currentStep={currentStep}
            colors={colors}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
};

interface ProgressSegmentProps {
  step: number;
  currentStep: number;
  colors: ReturnType<typeof useTheme>["colors"];
  theme: ReturnType<typeof useTheme>["theme"];
}

const ProgressSegment: React.FC<ProgressSegmentProps> = ({
  step,
  currentStep,
  colors,
  theme,
}) => {
  const isActive = step <= currentStep;
  const wasJustActivated = React.useRef(false);

  const fillProgress = useSharedValue(isActive ? 1 : 0);
  const glow = useSharedValue(0);
  const containerScale = useSharedValue(1);

  useEffect(() => {
    // Check if this segment just became active
    if (isActive && !wasJustActivated.current) {
      wasJustActivated.current = true;

      // Haptic feedback on completion
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Container scale pulse
      containerScale.value = withSequence(
        withSpring(1.08, {
          damping: 15,
          stiffness: 400,
        }),
        withSpring(1, {
          damping: 20,
          stiffness: 400,
        })
      );

      // Glow effect
      glow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
    } else if (!isActive && wasJustActivated.current) {
      wasJustActivated.current = false;
      containerScale.value = 1;
      glow.value = 0;
    }
    if (isActive) {
      fillProgress.value = withSpring(1, {
        damping: 14,
        stiffness: 320,
        mass: 0.9,
      });
    } else {
      fillProgress.value = withTiming(0, { duration: 220 });
    }
  }, [isActive]);

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    shadowOpacity: glow.value * 0.6,
    shadowRadius: glow.value * 8,
  }));

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.subtleBackground,
          overflow: "visible",
          shadowColor: colors.accent,
          shadowOffset: { width: 0, height: 0 },
        },
        containerAnimatedStyle,
      ]}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <Animated.View
          style={[
            {
              height: "100%",
              backgroundColor: colors.accent,
              borderRadius: 2,
            },
            fillAnimatedStyle,
          ]}
        />
      </View>
    </Animated.View>
  );
};

type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    segmentsContainer: {
      flexDirection: "row",
      gap: theme.spacing.xs,
      alignItems: "center",
    },
  });
};
