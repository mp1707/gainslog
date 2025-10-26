import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme";

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

  const fillProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    if (isActive) {
      fillProgress.value = withTiming(1, { duration: 300 });
    } else {
      fillProgress.value = withTiming(0, { duration: 220 });
    }
  }, [isActive]);

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
  }));

  return (
    <View
      style={{
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.subtleBackground,
        overflow: "hidden",
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
