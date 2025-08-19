import React, { useMemo, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Canvas, Circle, Path, Skia, Group } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
} from 'react-native-reanimated';
import { theme } from '@/theme';

// TypeScript interface for component props
interface NutrientPercentages {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutrientHubProps {
  percentages: NutrientPercentages;
}

// Ring configuration - from outermost to innermost
const RING_CONFIG = [
  { key: 'calories', colorKey: 'calories' as const },
  { key: 'protein', colorKey: 'protein' as const },
  { key: 'carbs', colorKey: 'carbs' as const },
  { key: 'fat', colorKey: 'fat' as const },
] as const;

// Component constants
const STROKE_WIDTH = 30;
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
export const NutrientHub: React.FC<NutrientHubProps> = ({ percentages }) => {
  const screenWidth = Dimensions.get('window').width;
  const containerSize = screenWidth - 100;
  const center = containerSize / 2;

  const outerRadius = center - STROKE_WIDTH / 2;
  const ringRadii = useMemo(() =>
    RING_CONFIG.map(
      (_, index) => outerRadius - index * (STROKE_WIDTH + RING_SPACING)
    ),
    [outerRadius]
  );

  // Use shared values for progress and scale animations
  const progress = useSharedValue({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const scale = useSharedValue(1);

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
      calories: withDelay(delays.calories, withSpring(targetValues.calories, springConfigs.calories)),
      protein: withDelay(delays.protein, withSpring(targetValues.protein, springConfigs.protein)),
      carbs: withDelay(delays.carbs, withSpring(targetValues.carbs, springConfigs.carbs)),
      fat: withDelay(delays.fat, withSpring(targetValues.fat, springConfigs.fat)),
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


  const colors = theme.getColors();
  const ringColors = useMemo(() => ({
    calories: colors.semantic.calories,
    protein: colors.semantic.protein,
    carbs: colors.semantic.carbs,
    fat: colors.semantic.fat,
  }), [colors]);
  const ringBackgroundColor = colors.disabledBackground;

  const ringPaths = useMemo(() =>
    ringRadii.map(radius => {
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
          strokeWidth={STROKE_WIDTH}
          strokeCap="round"
          opacity={0.3}
        />
        <Path
          path={path}
          color={color}
          style="stroke"
          strokeWidth={STROKE_WIDTH}
          strokeCap="round"
          start={0}
          // ✨ FIX: Pass the derived value object directly to the 'end' prop
          end={animatedEnd}
        />
      </React.Fragment>
    );
  };

  // Apply scale animation to the entire component
  const animatedStyle = useDerivedValue(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: containerSize,
          height: containerSize,
          alignSelf: 'center',
        },
        animatedStyle,
      ]}
    >
      <Canvas style={{ flex: 1 }}>
        <Group
          transform={[{ rotate: -Math.PI / 2 }]}
          origin={{ x: center, y: center }}
        >
          {RING_CONFIG.map((_, index) => renderRing(index))}
        </Group>
      </Canvas>
    </Animated.View>
  );
};