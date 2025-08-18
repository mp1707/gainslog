import React, { useMemo } from "react";
import { View } from "react-native";
import Svg from "react-native-svg";
import { useTheme } from "@/providers/ThemeProvider";
import { DailyProgress } from "@/types";
import { ActivityRing } from "./ActivityRing";
import { CentralDisplay } from "./CentralDisplay";
import { createStyles } from "./NutritionHub.styles";

interface NutritionHubProps {
  dailyProgress: DailyProgress;
  size?: number;
  showCenterContent?: boolean;
}

const RING_DEFINITIONS = [
  { id: "calories", unit: "kcal" },
  { id: "protein", unit: "g" },
  { id: "carbs", unit: "g" },
  { id: "fat", unit: "g" },
];

export const NutritionHub: React.FC<NutritionHubProps> = React.memo(
  ({ dailyProgress, size = 300, showCenterContent = true }) => {
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

    // Destructuring for easier access. The `React.memo` HOC will prevent re-renders
    // if the parent component passes a stable `dailyProgress` object reference.
    const { current, targets, percentages } = dailyProgress;

    // Memoize the rendered rings. This is the core optimization.
    // The map function will only re-run if the underlying data changes.
    // Since `ActivityRing` is also memoized, React will only re-render the specific
    // ring whose props have actually changed.
    const renderedRings = useMemo(() => {
      const strokeWidth = 18;
      const spacing = 6;
      const baseRadius = size / 2 - strokeWidth / 2;

      return RING_DEFINITIONS.map((ringDef, index) => {
        const nutrient = ringDef.id as keyof typeof current;

        // The target for a given ring could be 0, which is a valid state.
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
          />
        );
      });
    }, [size, ringColors, percentages, targets]);

    // This check is now simpler and more direct.
    const hasValidTargets = useMemo(
      () => Object.values(targets).some((t) => t > 0),
      [targets]
    );

    if (!hasValidTargets) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.ringsContainer}>
          {/* SVG stacking order is determined by render order. First element is at the bottom.
              This order correctly places the largest ring (calories) behind the others. */}
          <Svg width={size} height={size}>
            {renderedRings}
          </Svg>
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
