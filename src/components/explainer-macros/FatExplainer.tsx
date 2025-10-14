import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Droplet } from "lucide-react-native";
import { useRouter } from "expo-router";

import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button/Button";
import { Theme, useTheme } from "@/theme";

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
  const router = useRouter();

  const semanticColor = colors.semantic.fat;
  const computedPercentage = target > 0 ? Math.round((total / target) * 100) : 0;
  const progressPercentage = percentage ?? computedPercentage;

  const handleChangeTargets = () => {
    router.push("/onboarding/target-method");
  };

  return (
    <View style={styles.container}>
      <AppText role="Title1" style={styles.title}>
        Fat: Essential Baseline
      </AppText>

      <View style={styles.content}>
        {/* MacroGridCell-style display */}
        <View style={styles.displaySection}>
          <AppText role="Subhead" color="secondary" style={styles.label}>
            Fat
          </AppText>
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
          • Cook with olive oil, avocado oil, or grass-fed butter
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • Add satiating fats like salmon, eggs, nuts, and seeds
        </AppText>
        <AppText role="Body" color="secondary" style={styles.bulletPoint}>
          • Pair fats with protein to slow digestion and feel fuller longer
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
    displaySection: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    label: {
      textAlign: "center",
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
    bulletPoint: {
      lineHeight: 20,
      marginBottom: theme.spacing.xs / 2,
    },
    contentText: {
      lineHeight: 20,
    },
    buttonContainer: {
      alignItems: "center",
      paddingTop: theme.spacing.lg,
    },
  });
