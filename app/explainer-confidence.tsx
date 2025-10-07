import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { X, Sparkles } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";
import { StaticConfidenceBar } from "@/components/shared/StaticConfidenceBar";

export default function ExplainerConfidence() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.accent;

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
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.iconContainer}>
          <Sparkles size={64} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
        </View>

        <AppText role="Title1" style={styles.title}>
          Estimation Confidence
        </AppText>

        <View style={[styles.heroSection, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.heroBarContainer}>
            <StaticConfidenceBar confidenceLevel={3} />
          </View>
          <View style={styles.heroTextContainer}>
            <AppText
              role="Headline"
              color="primary"
              style={[styles.heroHeading, { color: semanticColor }]}
            >
              Understanding Your Confidence Score
            </AppText>
            <AppText role="Body" color="secondary" style={styles.heroText}>
              The confidence bar shows how detailed your food entry is. More specific measurements and ingredient details lead to more accurate macro estimates.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.levelHeader}>
            <StaticConfidenceBar confidenceLevel={3} />
            <AppText
              role="Headline"
              color="primary"
              style={[styles.levelHeading, { color: semanticColor }]}
            >
              Detailed Estimation
            </AppText>
          </View>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            All three bars filled means you've provided precise measurements for all ingredients. Your macro estimates are highly accurate.
            {"\n\n"}
            • All ingredients have specific amounts{"\n"}
            • Precise units used (g, ml, oz, etc.){"\n"}
            • No components flagged for refinement
          </AppText>
        </View>

        <View style={styles.section}>
          <View style={styles.levelHeader}>
            <StaticConfidenceBar confidenceLevel={2} />
            <AppText
              role="Headline"
              color="primary"
              style={styles.levelHeading}
            >
              Good Estimation
            </AppText>
          </View>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            Two bars filled indicates most ingredients are well-defined, but some details could be more precise.
            {"\n\n"}
            To reach Detailed Estimation:{"\n"}
            • Use more specific units where possible{"\n"}
            • Refine any flagged components{"\n"}
            • Add missing ingredient amounts
          </AppText>
        </View>

        <View style={styles.section}>
          <View style={styles.levelHeader}>
            <StaticConfidenceBar confidenceLevel={1} />
            <AppText
              role="Headline"
              color="primary"
              style={styles.levelHeading}
            >
              Broad Estimation
            </AppText>
          </View>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            One bar filled means basic information is present, but many details are missing or imprecise.
            {"\n\n"}
            To improve:{"\n"}
            • Add specific measurements to ingredients{"\n"}
            • Review and refine flagged components{"\n"}
            • Include all ingredient amounts
          </AppText>
        </View>

        <View style={styles.section}>
          <View style={styles.levelHeader}>
            <StaticConfidenceBar confidenceLevel={0} />
            <AppText
              role="Headline"
              color="primary"
              style={styles.levelHeading}
            >
              Estimation Pending
            </AppText>
          </View>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            No bars filled means ingredients need refinement before we can provide an accurate estimate.
            {"\n\n"}
            Next steps:{"\n"}
            • Add ingredient amounts and units{"\n"}
            • Refine all flagged components{"\n"}
            • Tap "Recalculate" when ready
          </AppText>
        </View>

        <View style={styles.footer}>
          <AppText role="Caption" color="secondary" style={styles.footerText}>
            Confidence levels help you understand the accuracy of your macro estimates. More precise entries lead to better tracking and results.
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
      marginBottom: theme.spacing.lg,
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
    section: {
      marginBottom: theme.spacing.xl,
    },
    levelHeader: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    levelHeading: {
      marginTop: theme.spacing.xs,
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
