import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Droplet } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { Theme, useTheme } from "@/theme";
import { FatProgressDisplay } from "@/components/daily-food-logs/NutrientSummary/NutrientStatDisplay";

interface FatExplainerProps {
  total?: number;
  target?: number;
  percentage?: number;
}

export const FatExplainer: React.FC<FatExplainerProps> = ({
  total = 52,
  target = 60,
  percentage,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const semanticColor = colors.semantic.fat;

  const computedPercentage = target > 0 ? Math.round((total / target) * 100) : 0;
  const progressPercentage = percentage ?? computedPercentage;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Droplet size={32} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
      </View>

      <AppText role="Title1" style={styles.title}>
        Fat: Essential Baseline
      </AppText>

      <View style={styles.content}>
        <View style={styles.labelContainer}>
          <FatProgressDisplay total={total} target={target} />
        </View>

        <AppText role="Headline" color="primary" style={[styles.sectionHeading, { color: semanticColor }]}>
          Hit Your Daily Target
        </AppText>
        <AppText role="Body" color="secondary" style={styles.contentText}>
          Aim for about {target}g of fat each day. You're currently at {progressPercentage}% of that goal with {total}g logged.
        </AppText>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
        >
          Why It Matters
        </AppText>
        <AppText role="Body" color="secondary" style={styles.contentText}>
          Dietary fat keeps hormones balanced, aids vitamin absorption, and helps meals stay satisfying. Stay close to your target to keep energy steady.
        </AppText>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
        >
          Smart Sources
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • Cook with olive oil, avocado oil, or grass-fed butter.
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • Add satiating fats like salmon, eggs, nuts, and seeds.
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • Pair fats with protein to slow digestion and feel fuller longer.
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
    labelContainer: {
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    sectionHeading: {
      marginBottom: theme.spacing.xs,
    },
    bulletPoint: {
      lineHeight: 20,
      marginBottom: theme.spacing.xs / 2,
    },
    contentText: {
      lineHeight: 20,
    },
  });
