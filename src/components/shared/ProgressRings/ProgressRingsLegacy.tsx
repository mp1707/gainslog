import React, { useMemo, useEffect } from "react";
import {
  Canvas,
  Circle,
  Path,
  Skia,
  Group,
  LinearGradient as SkiaLinearGradient,
} from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
import { createStyles } from "./ProgressRings.styles";

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface ProgressRingsProps {
  percentages: NutrientValues;
  size?: number;
  strokeWidth?: number;
  spacing?: number;
  padding?: number;
  overlays?: boolean;
}

const RING_CONFIG = [
  { key: "calories", colorKey: "calories" as const, label: "Calories" },
  { key: "protein", colorKey: "protein" as const, label: "Protein" },
  { key: "carbs", colorKey: "carbs" as const, label: "Carbs" },
  { key: "fat", colorKey: "fat" as const, label: "Fat" },
] as const;

export const ProgressRingsLegacy: React.FC<ProgressRingsProps> = ({
  percentages,
  size = 160,
  strokeWidth = 16,
  spacing = 2,
  padding = 2,
  overlays = false,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const center = size / 2;
  const progress = useSharedValue({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    const safePercentages = {
      calories: percentages.calories || 0,
      protein: percentages.protein || 0,
      carbs: percentages.carbs || 0,
      fat: percentages.fat || 0,
    };
    const targetValues = {
      calories: Math.min(1, Math.max(0, safePercentages.calories / 100)),
      protein: Math.min(1, Math.max(0, safePercentages.protein / 100)),
      carbs: Math.min(1, Math.max(0, safePercentages.carbs / 100)),
      fat: Math.min(1, Math.max(0, safePercentages.fat / 100)),
    };
    progress.value = {
      calories: withDelay(0, withSpring(targetValues.calories)),
      protein: withDelay(100, withSpring(targetValues.protein)),
      carbs: withDelay(200, withSpring(targetValues.carbs)),
      fat: withDelay(300, withSpring(targetValues.fat)),
    };
  }, [percentages, progress]);

  const outerRadius = center - strokeWidth / 2 - padding;
  const ringRadii = useMemo(() => {
    const radii = [];
    let currentRadius = outerRadius;
    for (let i = 0; i < RING_CONFIG.length; i++) {
      radii.push(currentRadius);
      if (i < RING_CONFIG.length - 1) currentRadius -= strokeWidth + spacing;
    }
    return radii;
  }, [outerRadius, strokeWidth, spacing]);

  const ringColors = {
    calories: colors.semantic.calories,
    protein: colors.semantic.protein,
    carbs: colors.semantic.carbs,
    fat: colors.semantic.fat,
  };

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

  return (
    <Animated.View key={colorScheme} style={styles.container}>
      <Canvas style={{ width: size, height: size }}>
        <Group
          transform={[{ rotate: -Math.PI / 2 }]}
          origin={{ x: center, y: center }}
        >
          {RING_CONFIG.map((config, index) => (
            <React.Fragment key={config.key}>
              <Path
                path={ringPaths[index]}
                color={colors.disabledBackground}
                style="stroke"
                strokeWidth={strokeWidth}
                opacity={0.5}
              />
              <Path
                path={ringPaths[index]}
                color={ringColors[config.colorKey]}
                style="stroke"
                strokeWidth={strokeWidth}
                strokeCap="round"
                start={0}
                end={animatedPathEnd[config.key]}
              />
              {overlays && (
                <>
                  {/* Shadow overlay clipped to filled arc */}
                  <Path
                    path={ringPaths[index]}
                    style="stroke"
                    strokeWidth={strokeWidth}
                    strokeCap="round"
                    start={0}
                    end={animatedPathEnd[config.key]}
                    opacity={0.6}
                  >
                    <SkiaLinearGradient
                      start={{ x: size, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.22)"]}
                    />
                  </Path>
                </>
              )}
            </React.Fragment>
          ))}
        </Group>
      </Canvas>
    </Animated.View>
  );
};
