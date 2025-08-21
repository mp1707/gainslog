import React, { useMemo, useEffect } from "react";
import { Dimensions, View, TouchableOpacity } from "react-native";
import { Canvas, Circle, Path, Skia, Group } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { theme } from "@/theme";
import { AppText } from "@/components/AppText";

// TypeScript interface for component props
interface NutrientValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface LargeNutrientHubProps {
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

// Component constants
const STROKE_WIDTHS = [30, 24, 18, 12]; // From outermost to innermost
const RING_SPACING = 8;

export const LargeNutrientHub: React.FC<LargeNutrientHubProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const availableWidth = screenWidth * 0.6;
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
  const [selectedNutrientIndex, setSelectedNutrientIndex] = React.useState(0);

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

  // Inner circle content component
  const InnerCircleContent = () => {
    const selectedConfig = RING_CONFIG[selectedNutrientIndex];
    const total = Math.round(totals[selectedConfig.key]);
    const target = Math.round(targets[selectedConfig.key]);

    return (
      <TouchableOpacity
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: [{ translateX: -80 }, { translateY: -60 }],
          width: 160,
          height: 120,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          borderRadius: theme.spacing.md,
        }}
        onPress={nextNutrient}
        activeOpacity={0.7}
        accessibilityLabel={`${selectedConfig.key}: ${total} of ${target} ${
          selectedConfig.key === "calories" ? "calories" : "grams"
        }. Tap to cycle through nutrients.`}
        accessibilityRole="button"
        accessibilityHint="Tap to view next nutrient"
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            minWidth: 70,
          }}
        >
          <AppText
            role="Body"
            style={{
              borderRadius: 50,
            }}
          >
            {selectedConfig.key.charAt(0).toUpperCase() +
              selectedConfig.key.slice(1)}
          </AppText>
          <AppText
            role="Caption"
            style={{
              textAlign: "center",
            }}
          >
            {selectedConfig.key === "calories"
              ? `${total}/${target}`
              : `${total}/${target}`}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  // Cycling function for nutrients
  const nextNutrient = () => {
    setSelectedNutrientIndex((prev) => (prev + 1) % RING_CONFIG.length);
  };

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
          justifyContent: "center",
          alignItems: "center",
          padding: theme.spacing.pageMargins.horizontal,
          minHeight: containerSize,
        },
        animatedContainerStyle,
      ]}
    >
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

        {/* <InnerCircleContent /> */}
      </View>
    </Animated.View>
  );
};
