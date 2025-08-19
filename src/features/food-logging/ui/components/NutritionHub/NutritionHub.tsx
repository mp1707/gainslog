import React, { useMemo } from "react";
import { View } from "react-native";
import { Canvas } from "@shopify/react-native-skia";
import { useTheme } from "@/providers/ThemeProvider";
import { ActivityRing } from "./ActivityRing";
import { CentralDisplay } from "./CentralDisplay";
import { createStyles } from "./NutritionHub.styles";

interface NutritionHubProps {
  current: { calories: number; protein: number; carbs: number; fat: number };
  targets: { calories: number; protein: number; carbs: number; fat: number };
  percentages: { calories: number; protein: number; carbs: number; fat: number };
  size?: number;
  showCenterContent?: boolean;
}

const RING_DEFINITIONS = [
  { id: "calories", unit: "kcal" },
  { id: "protein", unit: "g" },
  { id: "carbs", unit: "g" },
  { id: "fat", unit: "g" },
] as const;

export const NutritionHub: React.FC<NutritionHubProps> = React.memo(
  ({ current, targets, percentages, size = 300, showCenterContent = true }) => {
    const { colors, theme } = useTheme();
    const styles = useMemo(
      () => createStyles(colors, theme, size),
      [colors, theme, size]
    );

    const ringColors = useMemo(
      () => ({
        calories: colors.semantic?.calories ?? colors.accent,
        protein: colors.semantic?.protein ?? colors.accent,
        carbs: colors.semantic?.carbs ?? colors.accent,
        fat: colors.semantic?.fat ?? colors.accent,
      }),
      [colors.semantic, colors.accent]
    );

    const renderedRings = useMemo(() => {
      const strokeWidth = 18;
      const spacing = 6;
      const baseRadius = size / 2 - strokeWidth / 2;

      return RING_DEFINITIONS.map((ringDef, index) => {
        const nutrient = ringDef.id;
        const target = targets[nutrient] ?? 0;
        if (target <= 0) return null;

        return (
          <ActivityRing
            key={ringDef.id}
            size={size}
            animationDelay={index * 100}
            radius={baseRadius - index * (strokeWidth + spacing)}
            strokeWidth={strokeWidth}
            color={ringColors[nutrient]}
            percentage={percentages[nutrient] ?? 0}
            label={nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
            target={target}
            disabledBackgroundColor={colors.disabledBackground}
          />
        );
      });
    }, [size, ringColors, percentages, targets]);

    const hasValidTargets = useMemo(
      () => Object.values(targets).some((t) => t > 0),
      [targets]
    );

    if (!hasValidTargets) return null;

    return (
      <View style={styles.container}>
        <View style={styles.ringsContainer}>
          <Canvas style={{ width: size, height: size }}>
            {renderedRings}
          </Canvas>
          {showCenterContent && (
            <View style={styles.centerContent}>
              <CentralDisplay
                current={current.calories ?? 0}
                target={targets.calories ?? 0}
                percentage={percentages.calories ?? 0}
              />
            </View>
          )}
        </View>
      </View>
    );
  }
);
