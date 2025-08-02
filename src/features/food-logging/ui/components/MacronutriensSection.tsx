import React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "../../../../components/Card";
import { AppText } from "../../../../components/AppText";
import { RadialProgressBar } from "../../../../shared/ui/atoms/RadialProgressBar";
import { useTheme } from "../../../../providers/ThemeProvider";
import { DailyProgress } from "@/types/index";


interface MacronutriensSectionProps {
  dailyProgress: DailyProgress;
}

export const MacronutriensSection: React.FC<MacronutriensSectionProps> = ({
  dailyProgress,
}) => {
  const { theme, colors } = useTheme();

  const proteinData = {
    current: Math.round(dailyProgress.current.protein),
    target: dailyProgress.targets.protein,
    unit: "g",
    label: "Protein",
  };

  const fatData = {
    current: Math.round(dailyProgress.current.fat),
    target: dailyProgress.targets.fat,
    unit: "g",
    label: "Fat",
  };

  const carbsData = {
    current: Math.round(dailyProgress.current.carbs),
    target: dailyProgress.targets.carbs,
    unit: "g",
    label: "Carbs",
  };

  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
    },
    header: {
      color: colors.primaryText,
      marginBottom: theme.spacing.md,
    },
    macrosGrid: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    macroItem: {
      alignItems: "center",
    },
    headerStyle: {
      color: colors.primaryText,
      marginBottom: theme.spacing.md,
    },
  });

  return (
    <View>
      <AppText role="Headline" style={styles.headerStyle}>
        Macronutriens
      </AppText>
      <Card style={styles.container}>
        <View style={styles.macrosGrid}>
          <View style={styles.macroItem}>
            <RadialProgressBar
              current={proteinData.current}
              target={proteinData.target}
              unit={proteinData.unit}
              label={proteinData.label}
              size={88}
            />
          </View>
          <View style={styles.macroItem}>
            <RadialProgressBar
              current={fatData.current}
              target={fatData.target}
              unit={fatData.unit}
              label={fatData.label}
              size={88}
            />
          </View>
          <View style={styles.macroItem}>
            <RadialProgressBar
              current={carbsData.current}
              target={carbsData.target}
              unit={carbsData.unit}
              label={carbsData.label}
              size={88}
            />
          </View>
        </View>
      </Card>
    </View>
  );
};
