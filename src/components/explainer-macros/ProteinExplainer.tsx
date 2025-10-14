import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { BicepsFlexed, CircleCheckBig } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { Theme, useTheme } from "@/theme";
import { ProteinRingDisplay } from "@/components/daily-food-logs/NutrientSummary/NutrientStatDisplay";

interface ProteinExplainerProps {
  total?: number;
  target?: number;
  percentage?: number;
}

export const ProteinExplainer: React.FC<ProteinExplainerProps> = ({
  total = 145,
  target = 160,
  percentage = 91,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const semanticColor = colors.semantic.protein;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <BicepsFlexed size={32} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
      </View>

      <AppText role="Title1" style={styles.title}>
        Protein: Build & Recover
      </AppText>

      <View style={styles.content}>
        <View style={styles.ringContainer}>
          <ProteinRingDisplay total={total} target={target} percentage={percentage} />
        </View>

        <AppText role="Headline" color="primary" style={[styles.sectionHeading, { color: semanticColor }]}>
          How to Read the Ring
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>Ring Progress:</AppText> Tracks toward 100%
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <BicepsFlexed size={16} color={semanticColor} fill={semanticColor} strokeWidth={0} style={styles.inlineIcon} /> → <CircleCheckBig size={16} color={semanticColor} fill={colors.semanticSurfaces.protein} strokeWidth={2} style={styles.inlineIcon} /> when you hit your goal
        </AppText>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
        >
          Nutrition Guidelines
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>0.8 g/kg:</AppText> Maintenance
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>1.6 g/kg:</AppText> Optimal Growth
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>2.2 g/kg:</AppText> Dedicated Athletes
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>3.0 g/kg:</AppText> Preservation (Cutting)
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
    inlineIcon: {
      marginBottom: -2,
    },
  });
