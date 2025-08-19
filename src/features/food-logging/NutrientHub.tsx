import React, { useMemo, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { Canvas, Circle, Path, Skia, Group } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useDerivedValue,
  withSpring,
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
const STROKE_WIDTH = 10;
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
  // Get screen dimensions for responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const containerSize = screenWidth - 40; // 20px margin on each side
  const center = containerSize / 2;

  // Calculate ring radii based on container size
  const outerRadius = center - STROKE_WIDTH / 2;
  const ringRadii = useMemo(() => {
    return RING_CONFIG.map((_, index) => 
      outerRadius - (index * (STROKE_WIDTH + RING_SPACING))
    );
  }, [outerRadius]);

  // Shared values for animations - mapped by nutrient key
  const progressValues = useMemo(() => ({
    calories: useSharedValue(0),
    protein: useSharedValue(0),
    carbs: useSharedValue(0),
    fat: useSharedValue(0),
  }), []);

  // Get current color scheme colors
  const colors = theme.getColors();
  
  // Map nutrition colors from theme
  const ringColors = useMemo(() => ({
    calories: colors.semantic.calories,
    protein: colors.semantic.protein,
    carbs: colors.semantic.carbs,
    fat: colors.semantic.fat,
  }), [colors]);

  const ringBackgroundColor = colors.disabledBackground;

  // Create paths for each ring
  const ringPaths = useMemo(() => {
    return ringRadii.map(radius => {
      const path = Skia.Path.Make();
      path.addCircle(center, center, radius);
      return path;
    });
  }, [ringRadii, center]);

  // Animate to new percentage values when prop changes
  useEffect(() => {
    const springConfig = {
      damping: 15,
      stiffness: 150,
      mass: 1,
    };

    // Animate each nutrient's progress with spring physics
    Object.entries(percentages).forEach(([nutrient, percentage]) => {
      if (progressValues[nutrient as keyof typeof progressValues]) {
        progressValues[nutrient as keyof typeof progressValues].value = withSpring(
          Math.min(100, Math.max(0, percentage)) / 100, 
          springConfig
        );
      }
    });
  }, [percentages, progressValues]);

  // Create derived values for animated props - mapped by nutrient key
  const animatedProps = useMemo(() => {
    return Object.fromEntries(
      Object.entries(progressValues).map(([nutrient, progressValue]) => [
        nutrient,
        useDerivedValue(() => ({
          start: 0,
          end: progressValue.value,
        }))
      ])
    );
  }, [progressValues]);

  // Render individual ring component
  const renderRing = (ringIndex: number) => {
    const config = RING_CONFIG[ringIndex];
    const radius = ringRadii[ringIndex];
    const path = ringPaths[ringIndex];
    const color = ringColors[config.colorKey];
    const ringAnimatedProps = animatedProps[config.key];

    return (
      <React.Fragment key={config.key}>
        {/* Background circle - shows full ring capacity */}
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
        
        {/* Animated progress ring */}
        <Path
          path={path}
          color={color}
          style="stroke"
          strokeWidth={STROKE_WIDTH}
          strokeCap="round"
          start={ringAnimatedProps.value.start}
          end={ringAnimatedProps.value.end}
        />
      </React.Fragment>
    );
  };

  return (
    <View style={{ 
      width: containerSize, 
      height: containerSize, 
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Canvas style={{ width: containerSize, height: containerSize }}>
        {/* Rotate the entire group to start from top (12 o'clock position) */}
        <Group
          transform={[{ rotate: -Math.PI / 2 }]}
          origin={{ x: center, y: center }}
        >
          {/* Render all rings from outermost to innermost */}
          {RING_CONFIG.map((_, index) => renderRing(index))}
        </Group>
      </Canvas>
    </View>
  );
};

/*
SAMPLE USAGE:

import { NutrientHub } from '@/features/food-logging/NutrientHub';

const MyScreen = () => {
  const nutritionData = {
    calories: 75,  // 75% of daily calorie goal
    protein: 60,   // 60% of daily protein goal
    carbs: 85,     // 85% of daily carb goal
    fat: 40        // 40% of daily fat goal
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <NutrientHub percentages={nutritionData} />
    </View>
  );
};

PERFORMANCE NOTES:
- All animations run on the UI thread via react-native-reanimated
- Uses shared values and derived values for optimal performance
- Canvas rendering is hardware-accelerated via react-native-skia
- Component automatically adapts to screen width with proper margins
- Spring animations provide natural, satisfying motion with slight overshoot

DESIGN SYSTEM INTEGRATION:
- Colors automatically adapt to light/dark mode via theme system
- Uses semantic nutrition colors from theme.colors.semantic
- Ring background uses theme.colors.disabledBackground
- Follows 8pt grid spacing system from project standards
*/