import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { X, Zap } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";

export default function ExplainerCarbs() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.semantic.carbs;

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
          <Zap size={64} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
        </View>

        <AppText role="Title1" style={styles.title}>
          Carbs: Flexible Fuel
        </AppText>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Why Carbs Are Different
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            Unlike protein and fat, carbohydrates don't have a strict minimum or maximum target. They serve as your flexible fuel source, filling the remaining calories after you've optimized protein and fat.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            The Filler Macronutrient
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            After you've met your protein goal and fat baseline (20%+), carbs make up the rest of your calorie budget. This makes them the most flexible macronutrient—adjust based on your energy needs and preferences.
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
            We display carbs as a simple total without a progress ring or bar. Since there's no fixed target to hit, showing just the total gives you the information you need without creating unnecessary pressure.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Your Primary Energy Source
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            Carbs are your body's preferred fuel for training and daily activity. Higher activity levels typically benefit from more carbs, while lower activity may mean fewer carbs—it's entirely up to you and what supports your goals.
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
