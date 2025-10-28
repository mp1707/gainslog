import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Droplet } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button/Button";
import { Theme, useTheme } from "@/theme";
import { useSafeRouter } from "@/hooks/useSafeRouter";

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
  const router = useSafeRouter();

  const semanticColor = colors.semantic.fat;
  const computedPercentage = target > 0 ? Math.round((total / target) * 100) : 0;
  const progressPercentage = percentage ?? computedPercentage;

  const handleChangeTargets = () => {
    router.push("/onboarding/target-method");
  };

  return (
    <View style={styles.container}>
      <AppText role="Title1" style={styles.title}>
        Fat
      </AppText>
      <AppText role="Caption" style={styles.subTitle}>
        Essential Baseline
      </AppText>
      <View style={styles.content}>
        {/* MacroGridCell-style display */}
        <View style={styles.displaySection}>
          <View style={styles.valueRow}>
            <View style={styles.iconWrapper}>
              <Droplet
                size={22}
                color={semanticColor}
                fill={semanticColor}
                strokeWidth={0}
              />
            </View>
            <View style={styles.valueContainer}>
              <AppText role="Headline" color="primary">
                {total}
              </AppText>
              <AppText role="Body" color="secondary">
                {" "}
                /{" "}
              </AppText>
              <AppText role="Body" color="secondary">
                {target}
              </AppText>
              <AppText role="Body" color="secondary" style={styles.unitText}>
                {" "}
                g
              </AppText>
            </View>
          </View>
          {/* Progress Bar */}
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: colors.disabledBackground },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: semanticColor,
                  width: `${Math.min(progressPercentage, 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        <AppText role="Headline" color="primary" style={[styles.sectionHeading, { color: semanticColor }]}>
          Hit your daily target
        </AppText>
        <AppText role="Body" color="secondary" style={styles.contentText}>
          Aim for a steady baseline each day to keep energy and meals satisfying.
        </AppText>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
        >
          Why it matters
        </AppText>
        <AppText role="Body" color="secondary" style={styles.contentText}>
          Dietary fat supports hormones, helps absorb vitamins and keeps you full.
        </AppText>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
        >
          Smart sources
        </AppText>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            Cook with olive/avocado oil; include nuts, seeds, whole eggs, salmon.
          </AppText>
        </View>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            Favor mostly unsaturated fats.
          </AppText>
        </View>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            Saturated fat is fine in moderation—balance across the day.
          </AppText>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          label="Adjust targets"
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
    },
    subTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    content: {
      flex: 1,
    },
    displaySection: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    iconWrapper: {
      justifyContent: "center",
      alignItems: "center",
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    unitText: {
      marginLeft: theme.spacing.xs / 2,
    },
    progressBarTrack: {
      width: "55%",
      height: 5,
      borderRadius: 2.5,
      overflow: "hidden",
      marginTop: theme.spacing.xs,
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 2.5,
    },
    sectionHeading: {
      marginBottom: theme.spacing.xs,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    bulletChar: {
      lineHeight: 22,
    },
    bulletText: {
      flex: 1,
      lineHeight: 22,
    },
    contentText: {
      lineHeight: 20,
    },
    buttonContainer: {
      alignItems: "center",
      paddingTop: theme.spacing.lg,
    },
  });
