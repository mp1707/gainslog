import React, { useMemo, useEffect } from "react";
import {
  Dimensions,
  View,
  Text,
  AccessibilityInfo,
  TouchableOpacity,
} from "react-native";
import { Canvas, Circle, Path, Skia, Group } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  interpolate,
  SharedValue,
  runOnJS,
} from "react-native-reanimated";
import { ArrowRight } from "phosphor-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { theme } from "@/theme";
import { createStyles } from "./NutrientHub.styles";
import { AppText } from "@/components/AppText";

// TypeScript interface for component props
interface NutrientValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutrientHubProps {
  percentages: NutrientValues;
  targets: NutrientValues;
  totals: NutrientValues;
  scrollY?: SharedValue<number>;
}

// Ring configuration - from outermost to innermost
const RING_CONFIG = [
  { key: "calories", colorKey: "calories" as const },
  { key: "protein", colorKey: "protein" as const },
  { key: "carbs", colorKey: "carbs" as const },
  { key: "fat", colorKey: "fat" as const },
] as const;

// Component constants
const STROKE_WIDTHS = [34, 28, 22, 16]; // From outermost to innermost
const RING_SPACING = 8;

/**
 * NutrientHub - A high-performance React Native component that displays
 * four concentric animated rings representing daily nutritional progress.
 */
export const NutrientHub: React.FC<NutrientHubProps> = ({
  percentages,
  targets,
  totals,
  scrollY,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const screenWidth = Dimensions.get("window").width;
  // Calculate available width after page margins (20px each side)
  const availableWidth = screenWidth - theme.spacing.pageMargins.horizontal * 2;
  const containerSize = availableWidth;
  const center = containerSize / 2;

  const outerRadius = center - STROKE_WIDTHS[0] / 2;
  const ringRadii = useMemo(() => {
    const radii = [];
    let currentRadius = outerRadius;

    for (let i = 0; i < RING_CONFIG.length; i++) {
      radii.push(currentRadius);
      if (i < RING_CONFIG.length - 1) {
        currentRadius -=
          STROKE_WIDTHS[i] / 2 + RING_SPACING + STROKE_WIDTHS[i + 1] / 2;
      }
    }

    return radii;
  }, [outerRadius]);

  const progress = useSharedValue({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const scale = useSharedValue(1);

  // Binary animation state with hysteresis
  const compactModeValue = useSharedValue(0);

  // Check for reduced motion preference
  const [reducedMotionEnabled, setReducedMotionEnabled] = React.useState(false);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotionEnabled);
  }, []);

  // Hysteresis-based scroll detection
  const animationProgress = useDerivedValue(() => {
    if (!scrollY) return compactModeValue.value;

    const scrollY_val = scrollY.value;

    if (scrollY_val > 50 && compactModeValue.value === 0) {
      compactModeValue.value = withSpring(1, {
        damping: reducedMotionEnabled ? 20 : 12,
        stiffness: reducedMotionEnabled ? 200 : 300,
        mass: 0.8,
      });
    } else if (scrollY_val < 20 && compactModeValue.value === 1) {
      compactModeValue.value = withSpring(0, {
        damping: reducedMotionEnabled ? 20 : 12,
        stiffness: reducedMotionEnabled ? 200 : 300,
        mass: 0.8,
      });
    }

    return compactModeValue.value;
  });

  // Animate to new percentage values when props change
  useEffect(() => {
    const springConfigs = {
      calories: {
        damping: 10,
        stiffness: 400,
        mass: 0.8,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
      },
      protein: {
        damping: 12,
        stiffness: 300,
        mass: 1,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
      },
      carbs: {
        damping: 8,
        stiffness: 350,
        mass: 0.9,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
      },
      fat: {
        damping: 14,
        stiffness: 280,
        mass: 1.1,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
      },
    };

    const delays = {
      calories: 0,
      protein: 100,
      carbs: 200,
      fat: 300,
    };

    const targetValues = {
      calories: Math.min(1, Math.max(0, (percentages.calories || 0) / 100)),
      protein: Math.min(1, Math.max(0, (percentages.protein || 0) / 100)),
      carbs: Math.min(1, Math.max(0, (percentages.carbs || 0) / 100)),
      fat: Math.min(1, Math.max(0, (percentages.fat || 0) / 100)),
    };

    progress.value = {
      calories: withDelay(
        delays.calories,
        withSpring(targetValues.calories, springConfigs.calories)
      ),
      protein: withDelay(
        delays.protein,
        withSpring(targetValues.protein, springConfigs.protein)
      ),
      carbs: withDelay(
        delays.carbs,
        withSpring(targetValues.carbs, springConfigs.carbs)
      ),
      fat: withDelay(
        delays.fat,
        withSpring(targetValues.fat, springConfigs.fat)
      ),
    };

    scale.value = withSpring(1.02, {
      damping: 12,
      stiffness: 300,
      mass: 0.8,
    });

    setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
        mass: 1,
      });
    }, 150);
  }, [percentages, progress, scale]);

  const ringColors = useMemo(
    () => ({
      calories: colors.semantic.calories,
      protein: colors.semantic.protein,
      carbs: colors.semantic.carbs,
      fat: colors.semantic.fat,
    }),
    [colors]
  );
  const ringBackgroundColor = colors.disabledBackground;

  const ringPaths = useMemo(
    () =>
      ringRadii.map((radius) => {
        const path = Skia.Path.Make();
        path.addCircle(center, center, radius);
        return path;
      }),
    [ringRadii, center]
  );

  const animatedPathEnd = {
    calories: useDerivedValue(() => progress.value.calories),
    protein: useDerivedValue(() => progress.value.protein),
    carbs: useDerivedValue(() => progress.value.carbs),
    fat: useDerivedValue(() => progress.value.fat),
  };

  const renderRing = (ringIndex: number) => {
    const config = RING_CONFIG[ringIndex];
    const radius = ringRadii[ringIndex];
    const path = ringPaths[ringIndex];
    const color = ringColors[config.colorKey];
    const strokeWidth = STROKE_WIDTHS[ringIndex];
    const animatedEnd = animatedPathEnd[config.key];

    return (
      <React.Fragment key={config.key}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          color={ringBackgroundColor}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          opacity={0.3}
        />
        <Path
          path={path}
          color={color}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={animatedEnd}
        />
      </React.Fragment>
    );
  };

  // Helper component for the new, minimalist display
  const NutrientValueDisplay = ({
    label,
    value,
    unit,
    color,
    description,
    accessibilityLabel,
  }: {
    label: string;
    value: string;
    unit: string;
    color: string;
    description: string;
    accessibilityLabel: string;
  }) => (
    <View
      style={styles.nutrientValueContainer}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={description}
    >
      <View style={[styles.colorDot, { backgroundColor: color }]} />
      <Text style={styles.valueText}>{value}</Text>
      <Text style={styles.unitText}>{unit}</Text>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );

  // Inner circle content component for expanded view
  const InnerCircleContent = () => {
    const selectedConfig = RING_CONFIG[selectedNutrientIndex];
    const total = Math.round(totals[selectedConfig.key]);
    const target = Math.round(targets[selectedConfig.key]);

    return (
      <TouchableOpacity
        style={styles.touchableInfoSection}
        onPress={nextNutrient}
        activeOpacity={0.7}
        accessibilityLabel={`${selectedConfig.key}: ${total} of ${target} ${
          selectedConfig.key === "calories" ? "calories" : "grams"
        }. Tap to cycle through nutrients.`}
        accessibilityRole="button"
        accessibilityHint="Tap to view next nutrient"
      >
        <View style={[styles.innerCircleContent]}>
          <AppText role="Body" style={styles.innerNutrientLabel}>
            {selectedConfig.key.charAt(0).toUpperCase() +
              selectedConfig.key.slice(1)}
          </AppText>
          <AppText role="Caption" style={styles.innerNutrientValue}>
            {selectedConfig.key === "calories"
              ? `${total}/${target}`
              : `${total}/${target}`}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  const [isCompactMode, setIsCompactMode] = React.useState(false);
  const [selectedNutrientIndex, setSelectedNutrientIndex] = React.useState(0);

  useAnimatedReaction(
    () => compactModeValue.value,
    (currentValue) => {
      const shouldBeCompact = currentValue > 0.5;
      runOnJS(setIsCompactMode)(shouldBeCompact);
    }
  );

  // Cycling functions for nutrients
  const nextNutrient = () => {
    setSelectedNutrientIndex((prev) => (prev + 1) % RING_CONFIG.length);
  };

  // Animated styles for the main container and content
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedRingStyle = useAnimatedStyle(() => {
    const ringScale = interpolate(animationProgress.value, [0, 1], [1, 0.35]);
    // Reduce translation to account for page margins and keep proper spacing
    const translateX = interpolate(
      animationProgress.value,
      [0, 1],
      [0, screenWidth * 0.6]
    );

    return {
      transform: [{ scale: ringScale }, { translateX: translateX }],
    };
  });

  const animatedValuesStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animationProgress.value,
      [0, 1],
      [0, -screenWidth * 0.08]
    );

    return {
      transform: [{ translateX: translateX }],
    };
  });

  // Dynamic styles based on compact mode
  const containerLayoutStyle = isCompactMode
    ? {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        height: containerSize * 0.45,
      }
    : {
        flexDirection: "column" as const,
        alignItems: "center" as const,
        minHeight: containerSize,
      };

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        animatedContainerStyle,
        containerLayoutStyle,
      ]}
    >
      {/* Ring Canvas */}
      <Animated.View style={animatedRingStyle}>
        <Canvas
          style={{
            width: containerSize,
            height: containerSize,
          }}
        >
          <Group
            transform={[{ rotate: -Math.PI / 2 }]}
            origin={{ x: center, y: center }}
          >
            {RING_CONFIG.map((_, index) => renderRing(index))}
          </Group>
        </Canvas>

        {/* Inner circle content for expanded view only */}
        {!isCompactMode && <InnerCircleContent />}
      </Animated.View>

      {/* Compact mode: Show all nutrient values */}
      {isCompactMode && (
        <Animated.View
          style={[
            styles.nutrientValuesWrapper,
            animatedValuesStyle,
            styles.compactValuesWrapper,
          ]}
        >
          {RING_CONFIG.map((config) => {
            const total = Math.round(totals[config.key]);
            const target = Math.round(targets[config.key]);
            const percentage = Math.round(percentages[config.key] || 0);

            // Accessing semantic colors from the theme
            const color = colors.semantic[config.key];

            const description =
              config.key === "calories"
                ? "Energy from food"
                : config.key === "protein"
                ? "Muscle building blocks"
                : config.key === "carbs"
                ? "Quick energy source"
                : "Essential nutrients";

            return (
              <NutrientValueDisplay
                key={config.key}
                label={config.key === "calories" ? "kcal" : config.key}
                value={
                  config.key === "calories" ? `${total}` : `${total}/${target}`
                }
                unit={config.key === "calories" ? "" : "g"}
                color={color}
                description={description}
                accessibilityLabel={`${config.key}: ${total} of ${target} ${
                  config.key === "calories" ? "kcal" : "grams"
                }. ${percentage}% of daily target.`}
              />
            );
          })}
        </Animated.View>
      )}
    </Animated.View>
  );
};
