import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, Droplet, CircleCheckBig } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";

export default function ExplainerFat() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{
    total?: string;
    target?: string;
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
  const isComplete = total >= target;

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
          Fat: Essential Nutrient
        </AppText>

        <View style={[styles.unifiedCard, { backgroundColor: colors.secondaryBackground }]}>
          <View style={styles.statDisplay}>
            <View style={styles.statRow}>
              {isComplete ? (
                <CircleCheckBig
                  size={24}
                  color={semanticColor}
                  fill={colors.semanticSurfaces.fat}
                  strokeWidth={2}
                />
              ) : (
                <Droplet
                  size={24}
                  color={semanticColor}
                  fill={semanticColor}
                  strokeWidth={0}
                />
              )}
              <View style={styles.statText}>
                <AppText role="Caption" color="secondary">
                  Fat
                </AppText>
                <View style={styles.values}>
                  <AppText role="Headline" color="primary">
                    {total}
                  </AppText>
                  <AppText role="Body" color="secondary">
                    {" / "}
                  </AppText>
                  <AppText role="Body" color="secondary">
                    {target}g
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor }]}
          >
            Your Target
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletPoint}>
            • <Droplet size={16} color={semanticColor} fill={semanticColor} strokeWidth={0} style={styles.inlineIcon} /> Working toward your goal
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletPoint}>
            • <CircleCheckBig size={16} color={semanticColor} fill={colors.semanticSurfaces.fat} strokeWidth={2} style={styles.inlineIcon} /> Target reached
          </AppText>

          <AppText
            role="Headline"
            color="primary"
            style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
          >
            Why It Matters
          </AppText>
          <AppText role="Body" color="secondary" style={styles.content}>
            Essential for hormones, vitamin absorption, and overall health. Aim to hit your daily target.
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
    statDisplay: {
      marginBottom: theme.spacing.md,
    },
    statRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    statText: {
      flex: 1,
      gap: theme.spacing.xs / 2,
    },
    values: {
      flexDirection: "row",
      alignItems: "center",
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
