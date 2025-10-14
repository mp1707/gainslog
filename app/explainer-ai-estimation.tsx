import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { X, Sparkles, Pencil, Camera, Mic } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { Theme, useTheme } from "@/theme";
import { useSafeRouter } from "@/hooks/useSafeRouter";

export default function ExplainerAiEstimation() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

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
          <Sparkles
            size={64}
            color={colors.accent}
            fill={colors.accent}
            strokeWidth={1.5}
          />
        </View>

        <AppText role="Title1" style={styles.title}>
          Pro-Tips for Best Results
        </AppText>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Pencil size={20} color={colors.accent} strokeWidth={1.5} />
            <AppText role="Title2" color="primary">
              Text Input
            </AppText>
          </View>
          <View>
            <View style={styles.bulletRow}>
              <AppText role="Body" color="secondary" style={styles.bulletChar}>
                •
              </AppText>
              <AppText role="Body" color="secondary" style={styles.bulletText}>
                Add weights or volumes for precision. (e.g., "150g chicken breast" vs. "chicken breast")
              </AppText>
            </View>
            <View style={styles.bulletRow}>
              <AppText role="Body" color="secondary" style={styles.bulletChar}>
                •
              </AppText>
              <AppText role="Body" color="secondary" style={styles.bulletText}>
                Include cooking methods and key ingredients. (e.g., "grilled with olive oil")
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Camera size={20} color={colors.accent} strokeWidth={1.5} />
            <AppText role="Title2" color="primary">
              Photo Scans
            </AppText>
          </View>
          <View>
            <View style={styles.bulletRow}>
              <AppText role="Body" color="secondary" style={styles.bulletChar}>
                •
              </AppText>
              <AppText role="Body" color="secondary" style={styles.bulletText}>
                Use bright, natural light.
              </AppText>
            </View>
            <View style={styles.bulletRow}>
              <AppText role="Body" color="secondary" style={styles.bulletChar}>
                •
              </AppText>
              <AppText role="Body" color="secondary" style={styles.bulletText}>
                Shoot from a top-down angle.
              </AppText>
            </View>
            <View style={styles.bulletRow}>
              <AppText role="Body" color="secondary" style={styles.bulletChar}>
                •
              </AppText>
              <AppText role="Body" color="secondary" style={styles.bulletText}>
                Keep all food in frame and uncovered.
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mic size={20} color={colors.accent} strokeWidth={1.5} />
            <AppText role="Title2" color="primary">
              Audio Logging
            </AppText>
          </View>
          <View>
            <View style={styles.bulletRow}>
              <AppText role="Body" color="secondary" style={styles.bulletChar}>
                •
              </AppText>
              <AppText role="Body" color="secondary" style={styles.bulletText}>
                Speak naturally, as if you were typing.
              </AppText>
            </View>
            <View style={styles.bulletRow}>
              <AppText role="Body" color="secondary" style={styles.bulletChar}>
                •
              </AppText>
              <AppText role="Body" color="secondary" style={styles.bulletText}>
                Mention details like weights, ingredients, and cooking methods.
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <AppText role="Caption" color="secondary" style={styles.footerText}>
            For best accuracy, use measured quantities when possible.
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
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    sectionContent: {
      lineHeight: 22,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    bulletChar: {
      lineHeight: 22,
    },
    bulletText: {
      flex: 1,
      lineHeight: 22,
    },
    footer: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: "rgba(128, 128, 128, 0.2)",
    },
    footerText: {
      textAlign: "center",
      lineHeight: 18,
    },
  });
