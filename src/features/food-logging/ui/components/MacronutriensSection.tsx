import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { AppText } from "@/components/AppText";
import { RadialProgressBar } from "@/shared/ui/atoms/RadialProgressBar";
import { useTheme } from "@/providers";
import { DailyProgress } from "@/types/index";
import { Card } from "@/components/Card";

interface MacronutriensSectionProps {
  dailyProgress: DailyProgress;
}

export const MacronutriensSection: React.FC<MacronutriensSectionProps> =
  React.memo(({ dailyProgress }) => {
    const { theme, colors } = useTheme();

    const { proteinData, fatData, carbsData } = useMemo(
      () => ({
        proteinData: {
          current: Math.round(dailyProgress.current.protein),
          target: dailyProgress.targets.protein,
          unit: "g",
          label: "Protein",
        },
        fatData: {
          current: Math.round(dailyProgress.current.fat),
          target: dailyProgress.targets.fat,
          unit: "g",
          label: "Fat",
        },
        carbsData: {
          current: Math.round(dailyProgress.current.carbs),
          target: dailyProgress.targets.carbs,
          unit: "g",
          label: "Carbs",
        },
      }),
      [dailyProgress]
    );

    const styles = useMemo(
      () =>
        StyleSheet.create({
          container: {
            padding: theme.spacing.lg,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          },
          notDefinedContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          },
          header: {
            color: colors.primaryText,
            marginBottom: theme.spacing.md,
          },
          macroItem: {
            alignItems: "center",
          },
          headerStyle: {
            color: colors.primaryText,
            marginBottom: theme.spacing.md,
          },
        }),
      [theme, colors]
    );

    const macroNutrientsNotDefined =
      proteinData.target === 0 &&
      fatData.target === 0 &&
      carbsData.target === 0;

    return (
      <View>
        <AppText role="Headline" style={styles.headerStyle}>
          Macronutriens
        </AppText>
        {macroNutrientsNotDefined ? (
          <Card style={styles.notDefinedContainer}>
            <AppText role="Caption">
              Define your daily targets on the settings tab
            </AppText>
          </Card>
        ) : (
          <Card style={styles.container}>
            <View style={styles.macroItem}>
              <RadialProgressBar
                current={proteinData.current}
                target={proteinData.target}
                unit={proteinData.unit}
                label={proteinData.label}
                size={88}
                color={colors.semantic?.protein || colors.accent}
              />
            </View>
            {carbsData.target !== 0 && (
              <View style={styles.macroItem}>
                <RadialProgressBar
                  current={carbsData.current}
                  target={carbsData.target}
                  unit={carbsData.unit}
                  label={carbsData.label}
                  size={88}
                  color={colors.semantic?.carbs || colors.accent}
                />
              </View>
            )}
            {fatData.target !== 0 && (
              <View style={styles.macroItem}>
                <RadialProgressBar
                  current={fatData.current}
                  target={fatData.target}
                  unit={fatData.unit}
                  label={fatData.label}
                  size={88}
                  color={colors.semantic?.fat || colors.accent}
                />
              </View>
            )}
          </Card>
        )}
      </View>
    );
  });
