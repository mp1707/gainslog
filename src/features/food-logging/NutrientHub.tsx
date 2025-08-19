import React, { useMemo, useEffect } from "react";
import { Dimensions, View, Text } from "react-native";
import { Canvas, Circle, Path, Skia, Group } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  interpolate,
  Extrapolate,
  SharedValue,
  runOnJS,
} from "react-native-reanimated";
import { theme } from "@/theme";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./NutrientHub.styles";

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
const STROKE_WIDTHS = [32, 26, 20, 14]; // From outermost to innermost
const RING_SPACING = 8;

/**
 * NutrientHub - A high-performance React Native component that displays
 * four concentric animated rings representing daily nutritional progress.
 *
 * Features:
 * - Four concentric rings (Calories, Protein, Carbs, Fat)
 * - Smooth spring animations on the UI thread
 * - Dynamic theme color integration
 * - Clockwise fill animation from top position
 * - Optimized for 60fps performance
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
  const containerSize = screenWidth * 0.7;
  const center = containerSize / 2;

  const outerRadius = center - STROKE_WIDTHS[0] / 2;
  const ringRadii = useMemo(() => {
    const radii = [];
    let currentRadius = outerRadius;

    for (let i = 0; i < RING_CONFIG.length; i++) {
      radii.push(currentRadius);
      if (i < RING_CONFIG.length - 1) {
        // Move to next ring: half current stroke + spacing + half next stroke
        currentRadius -=
          STROKE_WIDTHS[i] / 2 + RING_SPACING + STROKE_WIDTHS[i + 1] / 2;
      }
    }

    return radii;
  }, [outerRadius]);

  // Use shared values for progress and scale animations
  const progress = useSharedValue({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const scale = useSharedValue(1);
  
  // Binary animation state with hysteresis
  const compactModeValue = useSharedValue(0);

  // Hysteresis-based scroll detection for snappy animation
  const animationProgress = useDerivedValue(() => {
    if (!scrollY) return compactModeValue.value;
    
    const scrollY_val = scrollY.value;
    
    // Hysteresis thresholds: enter compact at 50px, exit at 20px
    if (scrollY_val > 50 && compactModeValue.value === 0) {
      // Snap to compact mode
      compactModeValue.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
        mass: 0.6,
      });
    } else if (scrollY_val < 20 && compactModeValue.value === 1) {
      // Snap to normal mode
      compactModeValue.value = withSpring(0, {
        damping: 15,
        stiffness: 400,
        mass: 0.6,
      });
    }
    
    return compactModeValue.value;
  });

  // Animate to new percentage values when props change
  useEffect(() => {
    // Nutrient-specific spring configurations for satisfying animations
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

    // Staggered animation timing for cascading effect
    const delays = {
      calories: 0,
      protein: 100,
      carbs: 200,
      fat: 300,
    };

    // Animate each nutrient with its own spring config and delay
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

    // Add subtle scale animation for enhanced visual feedback
    scale.value = withSpring(1.02, {
      damping: 12,
      stiffness: 300,
      mass: 0.8,
    });

    // Return to normal scale after brief pause
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

  // Create derived values for the 'end' prop of each progress path
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
    // Directly use the derived value for the corresponding nutrient
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
          // ✨ FIX: Pass the derived value object directly to the 'end' prop
          end={animatedEnd}
        />
      </React.Fragment>
    );
  };

  // Helper function to get nutrient display info for badges
  const getNutrientInfo = (nutrientKey: keyof NutrientValues) => {
    const total = Math.round(totals[nutrientKey]);
    const target = Math.round(targets[nutrientKey]);
    
    // Use different labels for compact vs normal mode
    const names = isCompactMode ? {
      calories: "Cal",
      protein: "Prot",
      carbs: "Carb",
      fat: "Fat",
    } : {
      calories: "Cal",
      protein: "Protein",
      carbs: "Carbs",
      fat: "Fat",
    };
    
    return {
      name: names[nutrientKey],
      value: `${total}/${target}`,
      colors: colors.semanticBadges[nutrientKey],
    };
  };

  // Create a regular state for layout mode to avoid Reanimated layout property issues
  const [isCompactMode, setIsCompactMode] = React.useState(false);

  // Monitor animation progress and update layout mode using useAnimatedReaction
  useAnimatedReaction(
    () => compactModeValue.value,
    (currentValue) => {
      const shouldBeCompact = currentValue > 0.5;
      runOnJS(setIsCompactMode)(shouldBeCompact);
    }
  );

  // Animated styles using only transform properties (Reanimated compatible)
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedRingStyle = useAnimatedStyle(() => {
    // Much smaller ring for ultra-compact mode
    const ringScale = interpolate(animationProgress.value, [0, 1], [1, 0.42]);
    const translateX = interpolate(animationProgress.value, [0, 1], [0, screenWidth * 0.12]);
    
    return {
      transform: [
        { scale: ringScale },
        { translateX: translateX }
      ],
    };
  });

  const animatedBadgeStyle = useAnimatedStyle(() => {
    const translateX = interpolate(animationProgress.value, [0, 1], [0, -screenWidth * 0.15]);
    // Remove opacity animation for cleaner snapping
    
    return {
      transform: [{ translateX: translateX }],
    };
  });

  // Dynamic styles based on compact mode
  const containerLayoutStyle = isCompactMode ? {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8, // Tighter spacing for ultra-compact mode
    height: containerSize * 0.42 + 10, // Constrain height to ring size + small margin
  } : {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: 0,
  };

  const badgeLayoutStyle = isCompactMode ? {
    // 2x2 grid layout for compact mode
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    width: 130, // Fixed width for 2x2 grid
    marginTop: 0,
    gap: 4, // Tight spacing for compact look
  } : {
    flexDirection: 'row' as const,
    width: '100%' as const,
    marginTop: theme.spacing.md,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.sm,
  };

  return (
    <View style={styles.container}>
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
        </Animated.View>

        {/* Badge legend */}
        <Animated.View style={[
          styles.badgeLegend, 
          animatedBadgeStyle,
          badgeLayoutStyle
        ]}>
          {RING_CONFIG.map((config) => {
            const info = getNutrientInfo(config.key);
            const badgeStyle = isCompactMode ? styles.compactBadge : styles.badge;
            const titleStyle = isCompactMode ? styles.compactBadgeTitle : styles.badgeTitle;
            const valueStyle = isCompactMode ? styles.compactBadgeValue : styles.badgeValue;
            
            return (
              <View
                key={config.key}
                style={[
                  badgeStyle,
                  { backgroundColor: info.colors.background }
                ]}
              >
                <Text
                  style={[
                    titleStyle,
                    { color: info.colors.text }
                  ]}
                >
                  {info.name}
                </Text>
                <Text style={valueStyle}>
                  {info.value}
                </Text>
              </View>
            );
          })}
        </Animated.View>
      </Animated.View>
    </View>
  );
};
