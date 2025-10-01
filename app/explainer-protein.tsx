import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { X, BicepsFlexed } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";
import { ProteinRingDisplay } from "@/components/daily-food-logs/NutrientSummary/NutrientStatDisplay";
import { CircleCheckBig } from "lucide-react-native";

export default function ExplainerProtein() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.semantic.protein;

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
          <BicepsFlexed size={64} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
        </View>

        <AppText role="Title1" style={styles.title}>
          Protein: Build & Recover
        </AppText>

        <View style={[styles.heroSection, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.heroRingContainer}>
            <ProteinRingDisplay total={145} target={160} percentage={91} />
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
              The ring shows your daily progress toward your protein goal. When you reach 100%, you'll see a success indicator—this is a primary metric that drives your results.
            </AppText>
            <AppText role="Body" color="secondary" style={[styles.heroText, styles.heroIconExplanation]}>
              When you hit 100%, the <BicepsFlexed size={16} color={semanticColor} fill={semanticColor} strokeWidth={0} style={styles.inlineIcon} /> icon becomes a <CircleCheckBig size={16} color={semanticColor} fill={colors.semanticSurfaces.protein} strokeWidth={2} style={styles.inlineIcon} /> checkmark.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Why Protein Matters
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            Protein is critical for muscle growth, recovery, and maintenance. It's your primary macronutrient target alongside calories, and hitting your protein goal is essential for maximizing training adaptations.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            How Your Target is Set
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            Your protein goal is calculated based on your body weight multiplied by a goal factor that matches your training intensity. Factors range from 0.8 g/kg (basic maintenance) to 3.0 g/kg (maximum preservation during cutting).
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Goal Factor Examples
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            • 0.8 g/kg: Daily maintenance for general health{"\n"}
            • 1.6 g/kg: Optimal growth (evidence-based sweet spot){"\n"}
            • 2.2 g/kg: Anabolic insurance for dedicated athletes{"\n"}
            • 3.0 g/kg: Maximum preservation during significant deficits
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
      alignItems: "center",
    },
    heroRingContainer: {
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
