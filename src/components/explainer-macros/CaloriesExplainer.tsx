import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ChevronDown, ChevronsDown } from "lucide-react-native";
import { useRouter } from "expo-router";

import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button/Button";
import { Theme, useTheme } from "@/theme";
import { DashboardRing } from "@/components/shared/ProgressRings";

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
  const router = useRouter();

  const semanticColor = colors.semantic.calories;
  const ChevronIcon = percentage >= 100 ? ChevronsDown : ChevronDown;

  const handleChangeTargets = () => {
    router.push("/onboarding/target-method");
  };

  return (
    <View style={styles.container}>
      <AppText role="Title1" style={styles.title}>
        Calories: Your Energy Budget
      </AppText>

      <View style={styles.content}>
        <View style={styles.ringSection}>
          <AppText role="Subhead" color="secondary" style={styles.ringLabel}>
            Calories
          </AppText>
          <View style={styles.ringContainer}>
            <DashboardRing
              percentage={percentage}
              color={semanticColor}
              trackColor={colors.semanticSurfaces.calories}
              textColor={colors.primaryText}
              displayValue={total}
              displayUnit="kcal"
              detailValue={`of ${target}`}
              animationDelay={0}
              strokeWidth={18}
              Icon={ChevronIcon}
              skipAnimation
            />
          </View>
        </View>

        <AppText role="Headline" color="primary" style={[styles.sectionHeading, { color: semanticColor }]}>
          How to Read the Ring
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • The ring shows your consumed calories vs. your daily target
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <ChevronDown size={16} color={semanticColor} strokeWidth={2} style={styles.inlineIcon} /> Single chevron means you're under your target
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <ChevronsDown size={16} color={semanticColor} strokeWidth={2} style={styles.inlineIcon} /> Double chevron means you've reached or exceeded your target
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

      <View style={styles.buttonContainer}>
        <Button
          label="Change targets"
          variant="secondary"
          onPress={handleChangeTargets}
        />
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
    title: {
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    ringSection: {
      alignItems: "center",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    ringLabel: {
      textAlign: "center",
    },
    ringContainer: {
      alignItems: "center",
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
    buttonContainer: {
      alignItems: "center",
      paddingTop: theme.spacing.lg,
    },
  });
