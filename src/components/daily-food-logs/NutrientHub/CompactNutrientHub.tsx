import React, { useMemo, useEffect } from "react";
import {
  Dimensions,
  View,
  Text,
  AccessibilityInfo,
} from "react-native";
import { Canvas, Circle, Path, Skia, Group } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import { theme } from "@/theme";

// TypeScript interface for component props
interface NutrientValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface CompactNutrientHubProps {
  percentages: NutrientValues;
  targets: NutrientValues;
  totals: NutrientValues;
}

// Ring configuration - from outermost to innermost
const RING_CONFIG = [
  { key: "calories", colorKey: "calories" as const },
  { key: "protein", colorKey: "protein" as const },
  { key: "carbs", colorKey: "carbs" as const },
  { key: "fat", colorKey: "fat" as const },
] as const;

// Component constants for compact mode (smaller than original)
const COMPACT_STROKE_WIDTHS = [12, 10, 8, 6]; // Smaller stroke widths
const COMPACT_RING_SPACING = 3; // Tighter spacing
const COMPACT_SCALE = 0.35; // 35% of original size

export const CompactNutrientHub: React.FC<CompactNutrientHubProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const availableWidth = screenWidth - theme.spacing.pageMargins.horizontal * 2;
  const originalContainerSize = availableWidth;
  const containerSize = originalContainerSize * COMPACT_SCALE;
  const center = containerSize / 2;

  const outerRadius = center - COMPACT_STROKE_WIDTHS[0] / 2;
  const ringRadii = useMemo(() => {
    const radii = [];
    let currentRadius = outerRadius;

    for (let i = 0; i < RING_CONFIG.length; i++) {
      radii.push(currentRadius);
      if (i < RING_CONFIG.length - 1) {
        currentRadius -=
          COMPACT_STROKE_WIDTHS[i] / 2 + COMPACT_RING_SPACING + COMPACT_STROKE_WIDTHS[i + 1] / 2;
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
  const [reducedMotionEnabled, setReducedMotionEnabled] = React.useState(false);

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotionEnabled);
  }, []);

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
    const strokeWidth = COMPACT_STROKE_WIDTHS[ringIndex];
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

  // Helper component for nutrient value display
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
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
      }}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={description}
    >
      <View
        style={{
          width: theme.spacing.sm,
          height: theme.spacing.sm,
          borderRadius: theme.spacing.xs,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          ...theme.typography.Body,
          fontWeight: "700",
          color: colors.primaryText,
        }}
      >
        {value}{unit}
      </Text>
      <Text
        style={{
          ...theme.typography.Caption,
          color: colors.secondaryText,
        }}
      >
        {label}
      </Text>
    </View>
  );

  // Animated styles for the main container
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          padding: theme.spacing.pageMargins.horizontal,
          height: containerSize * 1.2, // Slightly taller for better spacing
        },
        animatedContainerStyle,
      ]}
    >
      {/* Small rings on the left */}
      <View>
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
      </View>

      {/* Nutrient values on the right */}
      <View
        style={{
          flex: 1,
          marginLeft: theme.spacing.xl,
          justifyContent: "center",
        }}
      >
        {RING_CONFIG.map((config) => {
          const total = Math.round(totals[config.key]);
          const target = Math.round(targets[config.key]);
          const percentage = Math.round(percentages[config.key] || 0);

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
      </View>
    </Animated.View>
  );
};