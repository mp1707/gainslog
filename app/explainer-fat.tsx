import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { X, Droplet } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";

export default function ExplainerFat() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.semantic.fat;

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.closeButton}>
        <RoundButton
          onPress={handleClose}
          Icon={X}
          variant="tertiary"
          accessibilityLabel="Close explainer"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Droplet size={64} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
        </View>

        <AppText role="Title1" style={styles.title}>
          Fat: Essential Baseline
        </AppText>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Why Fat Matters
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            Dietary fat is essential for hormone production, vitamin absorption, and overall health. While it's not the primary focus like protein, maintaining a minimum intake is crucial for your wellbeing.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            The 20% Minimum Rule
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            A healthy baseline is at least 20% of your total calories from fat. This ensures adequate intake for essential bodily functions. The optimal range is typically 20-40% of calories, depending on your preferences and needs.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Why We Show It This Way
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            The progress bar tracks your fat intake up to the 20% minimum threshold. This is more of a baseline check rather than a strict target—once you hit 20%, you're in a healthy range. You'll see a success indicator when you reach 100% of this baseline.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Flexibility Within Range
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            After hitting your protein and calorie targets, you can adjust your fat intake anywhere in the 20-40% range based on what feels best for your body and training.
          </AppText>
        </View>

        <View style={styles.footer}>
          <AppText role="Caption" color="secondary" style={styles.footerText}>
            These recommendations are general guidelines. Consult with a
            nutritionist or healthcare provider for personalized advice.
          </AppText>
        </View>
      </ScrollView>
    </GradientWrapper>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 15,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xxl,
      paddingBottom: theme.spacing.xl,
    },
    iconContainer: {
      alignItems: "center",
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    title: {
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeading: {
      marginBottom: theme.spacing.sm,
    },
    sectionContent: {
      lineHeight: 22,
    },
    footer: {
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: "rgba(128, 128, 128, 0.2)",
    },
    footerText: {
      textAlign: "center",
      lineHeight: 18,
    },
  });
