import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Zap } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";
import { CarbsStatDisplay } from "@/components/daily-food-logs/NutrientSummary/NutrientStatDisplay";

export default function ExplainerCarbs() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{ total?: string }>();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.semantic.carbs;

  // Parse params with fallback to example data
  const total = params.total ? parseInt(params.total) : 218;

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
          <Zap size={32} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
        </View>

        <AppText role="Title1" style={styles.title}>
          Carbs: Flexible Fuel
        </AppText>

        <View style={[styles.unifiedCard, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.statContainer}>
            <CarbsStatDisplay total={total} />
          </View>

          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            A Flexible Total
          </AppText>
          <AppText role="Body" color="secondary" style={styles.content}>
            No fixed target—carbs fill remaining calories after protein and fat.
          </AppText>

          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
          >
            Your Fuel Source
          </AppText>
          <AppText role="Body" color="secondary" style={styles.content}>
            Preferred fuel for training and activity. Adjust based on energy needs and activity level.
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
    statContainer: {
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    sectionHeading: {
      marginBottom: theme.spacing.xs,
    },
    content: {
      lineHeight: 20,
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
