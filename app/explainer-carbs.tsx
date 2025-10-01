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
          <Zap size={64} color={semanticColor} fill={semanticColor} strokeWidth={1.5} />
        </View>

        <AppText role="Title1" style={styles.title}>
          Carbs: Flexible Fuel
        </AppText>

        <View style={[styles.heroSection, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.heroStatContainer}>
            <CarbsStatDisplay total={total} />
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
              We display carbs as a simple total without a progress ring or bar. Since there's no fixed target to hit, showing just the total gives you the information you need without creating unnecessary pressure.
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
            Unlike protein and fat, carbs don't have a strict target—which is why we show just a simple total. They're your flexible fuel source, filling the remaining calories after protein and fat.
            {"\n\n"}
            Carbs are your body's preferred fuel for training and daily activity. Higher activity levels typically benefit from more carbs, lower activity may mean fewer. Adjust based on energy needs and what feels best.
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
    heroStatContainer: {
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
