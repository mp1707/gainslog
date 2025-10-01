import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { X, Flame } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";

export default function ExplainerCalories() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.semantic.calories;

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
          <Flame size={64} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
        </View>

        <AppText role="Title1" style={styles.title}>
          Calories: Your Energy Budget
        </AppText>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Why Calories Matter
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            Calories are the primary metric for weight management and the foundation of your nutrition strategy. Your calorie target directly determines whether you lose, maintain, or gain weight.
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
            Your calorie goal is calculated from your Total Daily Energy Expenditure (TDEE), based on your age, sex, weight, height, and activity level. We use the Mifflin-St Jeor equation to estimate your baseline needs.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            The Three Goals
          </AppText>
          <AppText role="Body" color="secondary" style={styles.sectionContent}>
            • Cut: -500 kcal from TDEE for gradual weight loss{"\n"}
            • Maintain: Exact TDEE to stay at current weight{"\n"}
            • Bulk: +500 kcal above TDEE for gradual weight gain
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
            The ring displays your remaining or exceeded calories for the day. This helps you stay on track and make informed decisions about your meals throughout the day.
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
