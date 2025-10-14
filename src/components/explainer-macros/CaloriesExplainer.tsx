import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { Theme, useTheme } from "@/theme";
import { CaloriesRingDisplay } from "@/components/daily-food-logs/NutrientSummary/NutrientStatDisplay";

interface CaloriesExplainerProps {
  total?: number;
  target?: number;
  percentage?: number;
}

export const CaloriesExplainer: React.FC<CaloriesExplainerProps> = ({
  total = 1850,
  target = 2200,
  percentage = 84,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const semanticColor = colors.semantic.calories;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Flame size={32} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
      </View>

      <AppText role="Title1" style={styles.title}>
        Calories: Your Energy Budget
      </AppText>

      <View style={styles.content}>
        <View style={styles.ringContainer}>
          <CaloriesRingDisplay total={total} target={target} percentage={percentage} />
        </View>

        <AppText role="Headline" color="primary" style={[styles.sectionHeading, { color: semanticColor }]}>
          How to Read the Ring
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • Displays remaining or exceeded calories for the day
        </AppText>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
        >
          Energy Targets
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>Cut:</AppText> -500 kcal (gradual loss)
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>Maintain:</AppText> TDEE (stay current weight)
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>Bulk:</AppText> +500 kcal (gradual gain)
        </AppText>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    iconContainer: {
      alignItems: "center",
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    title: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    ringContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    sectionHeading: {
      marginBottom: theme.spacing.xs,
    },
    bulletPoint: {
      lineHeight: 20,
      marginBottom: theme.spacing.xs / 2,
    },
    bold: {
      fontWeight: "600",
    },
  });
