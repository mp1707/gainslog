import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { BicepsFlexed, CircleCheckBig, ChevronDown, ChevronsDown } from "lucide-react-native";
import { useRouter } from "expo-router";

import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button/Button";
import { Theme, useTheme } from "@/theme";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { getNutrientIcon } from "@/components/daily-food-logs/NutrientSummary/utils/nutrientFormatters";

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
  const router = useRouter();

  const semanticColor = colors.semantic.protein;
  const ChevronIcon = percentage >= 100 ? ChevronsDown : ChevronDown;
  const isComplete = percentage >= 100;

  const handleChangeTargets = () => {
    router.push("/onboarding/target-method");
  };

  return (
    <View style={styles.container}>
      <AppText role="Title1" style={styles.title}>
        Protein: Build & Recover
      </AppText>

      <View style={styles.content}>
        <View style={styles.ringSection}>
          <AppText role="Subhead" color="secondary" style={styles.ringLabel}>
            Protein
          </AppText>
          <View style={styles.ringContainer}>
            <DashboardRing
              percentage={percentage}
              color={semanticColor}
              trackColor={colors.semanticSurfaces.protein}
              textColor={colors.primaryText}
              displayValue={total}
              displayUnit="g"
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
          • The ring tracks your progress toward 100% of your daily protein target
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • When you reach your goal, the icon changes: <BicepsFlexed size={16} color={semanticColor} fill={semanticColor} strokeWidth={0} style={styles.inlineIcon} /> → <CircleCheckBig size={16} color={semanticColor} fill={colors.semanticSurfaces.protein} strokeWidth={2} style={styles.inlineIcon} />
        </AppText>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
        >
          Nutrition Guidelines
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>0.8 g/kg:</AppText> Daily Maintenance
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>1.2 g/kg:</AppText> Active Lifestyle
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>1.6 g/kg:</AppText> Optimal Growth
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>2.0 g/kg:</AppText> Dedicated Athlete
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>2.2 g/kg:</AppText> Anabolic Insurance
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • <AppText role="Body" color="primary" style={styles.bold}>3.0 g/kg:</AppText> Max Preservation (Cutting)
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
