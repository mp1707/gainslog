import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Flame } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";
import { CaloriesRingDisplay } from "@/components/daily-food-logs/NutrientSummary/NutrientStatDisplay";

export default function ExplainerCalories() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{ total?: string; target?: string; percentage?: string }>();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.semantic.calories;

  // Parse params with fallback to example data
  const total = params.total ? parseInt(params.total) : 1850;
  const target = params.target ? parseInt(params.target) : 2200;
  const percentage = params.percentage ? parseInt(params.percentage) : 84;

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
          <Flame size={32} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
        </View>

        <AppText role="Title1" style={styles.title}>
          Calories: Your Energy Budget
        </AppText>

        <View style={[styles.unifiedCard, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.ringContainer}>
            <CaloriesRingDisplay total={total} target={target} percentage={percentage} />
          </View>

          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            How to Read the Ring
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletPoint}>
            • Displays remaining or exceeded calories for the day
          </AppText>

          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
          >
            Energy Targets
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletPoint}>
            • <AppText role="Body" color="primary" style={styles.bold}>Cut:</AppText> -500 kcal (gradual loss)
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletPoint}>
            • <AppText role="Body" color="primary" style={styles.bold}>Maintain:</AppText> TDEE (stay current weight)
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletPoint}>
            • <AppText role="Body" color="primary" style={styles.bold}>Bulk:</AppText> +500 kcal (gradual gain)
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
      marginBottom: theme.spacing.xxs,
    },
    bold: {
      fontWeight: "600",
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
