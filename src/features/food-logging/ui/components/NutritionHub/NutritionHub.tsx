import React, { useMemo, useCallback } from "react";
import { View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { DailyProgress } from "@/types";
import { ActivityRing } from "./ActivityRing";
import { CentralDisplay } from "./CentralDisplay";
import { createStyles } from "./NutritionHub.styles";
import Svg from "react-native-svg";

interface NutritionHubProps {
  dailyProgress: DailyProgress;
  size?: number;
  showCenterContent?: boolean;
}

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

    const {
      current: {
        calories: cCal = 0,
        protein: cProt = 0,
        carbs: cCarbs = 0,
        fat: cFat = 0,
      },
      targets: {
        calories: tCal = 2000,
        protein: tProt = 150,
        carbs: tCarbs = 250,
        fat: tFat = 67,
      },
      percentages: {
        calories: pCal = 0,
        protein: pProt = 0,
        carbs: pCarbs = 0,
        fat: pFat = 0,
      },
    } = dailyProgress;

    const ringConfig = useMemo(() => {
      const strokeWidth = 18;
      const spacing = 6;
      const baseRadius = size / 2 - strokeWidth / 2;

      return [
        {
          id: "calories",
          current: cCal,
          target: tCal,
          percentage: pCal,
          color: ringColors.calories,
          radius: baseRadius,
        },
        {
          id: "protein",
          current: cProt,
          target: tProt,
          percentage: pProt,
          color: ringColors.protein,
          radius: baseRadius - (strokeWidth + spacing),
        },
        {
          id: "carbs",
          current: cCarbs,
          target: tCarbs,
          percentage: pCarbs,
          color: ringColors.carbs,
          radius: baseRadius - 2 * (strokeWidth + spacing),
        },
        {
          id: "fat",
          current: cFat,
          target: tFat,
          percentage: pFat,
          color: ringColors.fat,
          radius: baseRadius - 3 * (strokeWidth + spacing),
        },
      ].map((r) => ({
        ...r,
        strokeWidth,
        label: r.id[0].toUpperCase() + r.id.slice(1),
        unit: r.id === "calories" ? "kcal" : "g",
      }));
    }, [
      cCal,
      cProt,
      cCarbs,
      cFat,
      tCal,
      tProt,
      tCarbs,
      tFat,
      pCal,
      pProt,
      pCarbs,
      pFat,
      size,
      ringColors,
    ]);

    const hasValidTargets = useMemo(
      () => ringConfig.some((r) => r.target > 0),
      [ringConfig]
    );

    const renderRing = useCallback(
      (ring: any, index: number) => (
        <ActivityRing
          key={ring.id}
          {...ring}
          size={size}
          animationDelay={index * 100}
        />
      ),
      [size]
    );

    if (!hasValidTargets) return null;

    return (
      <View style={styles.container}>
        <View style={styles.ringsContainer}>
          <Svg width={size} height={size}>
            {ringConfig.map(renderRing)}
          </Svg>
          {showCenterContent && (
            <View style={styles.centerContent}>
              <CentralDisplay current={cCal} target={tCal} percentage={pCal} />
            </View>
          )}
        </View>
      </View>
    );
  }
);
