import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter, useLocalSearchParams } from "expo-router";
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
  const params = useLocalSearchParams<{ total?: string; target?: string; percentage?: string }>();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.semantic.protein;

  // Parse params with fallback to example data
  const total = params.total ? parseInt(params.total) : 145;
  const target = params.target ? parseInt(params.target) : 160;
  const percentage = params.percentage ? parseInt(params.percentage) : 91;

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
          <BicepsFlexed size={32} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
        </View>

        <AppText role="Title1" style={styles.title}>
          Protein: Build & Recover
        </AppText>

        <View style={[styles.unifiedCard, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.ringContainer}>
            <ProteinRingDisplay total={total} target={target} percentage={percentage} />
          </View>

          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
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

          <View style={styles.footer}>
            <AppText role="Caption" color="secondary" style={styles.footerText}>
              General guidelines. Consult a nutritionist for personalized advice.
            </AppText>
          </View>
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
      paddingTop: theme.spacing.xl,
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
    unifiedCard: {
      borderRadius: theme.components.cards.cornerRadius,
      padding: theme.spacing.lg,
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
    footer: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: "rgba(128, 128, 128, 0.2)",
    },
    footerText: {
      textAlign: "center",
      lineHeight: 16,
    },
  });
