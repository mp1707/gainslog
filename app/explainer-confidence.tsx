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
          Confidence Score
        </AppText>

        <AppText role="Body" color="secondary" style={styles.subtitle}>
          Shows how precise your food entry is. More detail = more accurate macros.
        </AppText>

        <View style={styles.levelsContainer}>
          <View style={styles.levelItem}>
            <StaticConfidenceBar confidenceLevel={3} />
            <View style={styles.levelText}>
              <AppText role="Headline" color="primary" style={[{ color: semanticColor }]}>
                Detailed
              </AppText>
              <AppText role="Subhead" color="secondary">
                All ingredients with precise amounts
              </AppText>
            </View>
          </View>

          <View style={styles.levelItem}>
            <StaticConfidenceBar confidenceLevel={2} />
            <View style={styles.levelText}>
              <AppText role="Headline" color="primary">
                Good
              </AppText>
              <AppText role="Subhead" color="secondary">
                Most ingredients well-defined
              </AppText>
            </View>
          </View>

          <View style={styles.levelItem}>
            <StaticConfidenceBar confidenceLevel={1} />
            <View style={styles.levelText}>
              <AppText role="Headline" color="primary">
                Broad
              </AppText>
              <AppText role="Subhead" color="secondary">
                Basic info present, needs refinement
              </AppText>
            </View>
          </View>

          <View style={styles.levelItem}>
            <StaticConfidenceBar confidenceLevel={0} />
            <View style={styles.levelText}>
              <AppText role="Headline" color="primary">
                Pending
              </AppText>
              <AppText role="Subhead" color="secondary">
                Add amounts to calculate
              </AppText>
            </View>
          </View>
        </View>

        <View style={[styles.tipCard, { backgroundColor: colors.secondaryBackground }]}>
          <AppText role="Subhead" color="primary" style={styles.tipTitle}>
            💡 Quick Tip
          </AppText>
          <AppText role="Body" color="secondary">
            Use specific units (g, oz, ml) and refine flagged items to improve accuracy.
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
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
      lineHeight: 20,
    },
    levelsContainer: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    levelItem: {
      gap: theme.spacing.md,
    },
    levelText: {
      gap: theme.spacing.xs,
    },
    tipCard: {
      borderRadius: theme.components.cards.cornerRadius,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    tipTitle: {
      marginBottom: theme.spacing.xs,
    },
  });
