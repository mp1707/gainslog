import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Droplet } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";
import { FatProgressDisplay } from "@/components/daily-food-logs/NutrientSummary/NutrientStatDisplay";
import { CircleCheckBig } from "lucide-react-native";

export default function ExplainerFat() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{ total?: string; target?: string; percentage?: string }>();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.semantic.fat;

  // Parse params with fallback to example data
  const total = params.total ? parseInt(params.total) : 52;
  const target = params.target ? parseInt(params.target) : 60;
  const percentage = params.percentage ? parseInt(params.percentage) : 87;

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
          <Droplet
            size={64}
            color={semanticColor}
            fill={semanticColor}
            strokeWidth={1.5}
          />
        </View>

        <AppText role="Title1" style={styles.title}>
          Fat: Essential Baseline
        </AppText>

        <View
          style={[
            styles.heroSection,
            { backgroundColor: colors.secondaryBackground },
          ]}
        >
          <View style={styles.heroBarContainer}>
            <FatProgressDisplay total={total} target={target} percentage={percentage} />
          </View>
          <View style={styles.heroTextContainer}>
            <AppText
              role="Headline"
              color="primary"
              style={[styles.heroHeading, { color: semanticColor }]}
            >
              Why We Show It This Way
            </AppText>
            <AppText role="Body" color="secondary" style={styles.heroText}>
              The progress bar tracks your fat intake up to the 20% minimum
              threshold. This is more of a baseline check rather than a strict
              target—once you hit 20%, you're in a healthy range.
            </AppText>
            <AppText
              role="Body"
              color="secondary"
              style={[styles.heroText, styles.heroIconExplanation]}
            >
              At 100%, the{" "}
              <Droplet
                size={16}
                color={semanticColor}
                fill={semanticColor}
                strokeWidth={0}
                style={styles.inlineIcon}
              />{" "}
              icon becomes a{" "}
              <CircleCheckBig
                size={16}
                color={semanticColor}
                fill={colors.semanticSurfaces.fat}
                strokeWidth={2}
                style={styles.inlineIcon}
              />{" "}
              checkmark.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            The Essentials
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            Fat is essential for hormone production, vitamin absorption, and
            overall health. We track a minimum baseline of 20% of total
            calories—not a strict target, which is why it's a progress bar
            toward your minimal baseline.
            {"\n\n"}
            Once you hit 20%, you're in a healthy range. The optimal range is
            20-40% depending on your preferences. After hitting protein and
            calorie targets, adjust fat based on what feels best for your body.
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
      marginBottom: theme.spacing.lg,
    },
    heroSection: {
      marginBottom: theme.spacing.xl,
      borderRadius: theme.components.cards.cornerRadius,
      padding: theme.spacing.lg,
    },
    heroBarContainer: {
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    heroTextContainer: {
      width: "100%",
    },
    heroHeading: {
      marginBottom: theme.spacing.sm,
    },
    heroText: {
      lineHeight: 22,
    },
    heroIconExplanation: {
      marginTop: theme.spacing.sm,
    },
    inlineIcon: {
      marginBottom: -2,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    iconExplanation: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
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
