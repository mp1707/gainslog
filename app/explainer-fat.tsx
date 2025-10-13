import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Droplet } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";
import { FatProgressDisplay } from "@/components/daily-food-logs/NutrientSummary/NutrientStatDisplay";

export default function ExplainerFat() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{
    total?: string;
    target?: string;
    percentage?: string;
  }>();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const semanticColor = colors.semantic.fat;

  // Parse params with fallback to example data
  const total = params.total ? parseInt(params.total) : 52;
  const target = params.target ? parseInt(params.target) : 60;
  const percentage = params.percentage ? parseInt(params.percentage) : undefined;
  const computedPercentage = target > 0 ? Math.round((total / target) * 100) : 0;
  const progressPercentage = percentage ?? computedPercentage;

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
          <Droplet
            size={32}
            color={semanticColor}
            fill={semanticColor}
            strokeWidth={1.5}
          />
        </View>

        <AppText role="Title1" style={styles.title}>
          Fat: Essential Baseline
        </AppText>

        <View style={[styles.unifiedCard, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.labelContainer}>
            <FatProgressDisplay total={total} target={target} />
          </View>

          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Hit Your Daily Target
          </AppText>
          <AppText role="Body" color="secondary" style={styles.content}>
            Aim for about {target}g of fat each day. You're currently at {progressPercentage}% of that goal with {total}g logged.
          </AppText>

          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
          >
            Why It Matters
          </AppText>
          <AppText role="Body" color="secondary" style={styles.content}>
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
            • Cook with olive oil, avocado oil, or grass-fed butter.
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletPoint}>
            • Add satiating fats like salmon, eggs, nuts, and seeds.
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletPoint}>
            • Pair fats with protein to slow digestion and feel fuller longer.
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
    labelContainer: {
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    sectionHeading: {
      marginBottom: theme.spacing.xs,
    },
    bulletPoint: {
      lineHeight: 20,
      marginBottom: theme.spacing.xs / 2,
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
