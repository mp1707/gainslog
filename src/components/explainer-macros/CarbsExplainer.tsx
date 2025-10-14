import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Zap } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { Theme, useTheme } from "@/theme";
import { CarbsStatDisplay } from "@/components/daily-food-logs/NutrientSummary/NutrientStatDisplay";

interface CarbsExplainerProps {
  total?: number;
}

export const CarbsExplainer: React.FC<CarbsExplainerProps> = ({ total = 218 }) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const semanticColor = colors.semantic.carbs;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Zap size={32} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
      </View>

      <AppText role="Title1" style={styles.title}>
        Carbs: Flexible Fuel
      </AppText>

      <View style={styles.content}>
        <View style={styles.statContainer}>
          <CarbsStatDisplay total={total} />
        </View>

        <AppText role="Headline" color="primary" style={[styles.sectionHeading, { color: semanticColor }]}>
          A Flexible Total
        </AppText>
        <AppText role="Body" color="secondary" style={styles.contentText}>
          No fixed target—carbs fill remaining calories after protein and fat.
        </AppText>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
        >
          Your Fuel Source
        </AppText>
        <AppText role="Body" color="secondary" style={styles.contentText}>
          Preferred fuel for training and activity. Adjust based on energy needs and activity level.
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
    statContainer: {
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    sectionHeading: {
      marginBottom: theme.spacing.xs,
    },
    contentText: {
      lineHeight: 20,
    },
  });
