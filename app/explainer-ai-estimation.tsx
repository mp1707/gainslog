import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { X, Sparkles, Pencil, Camera, Mic } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { AppText } from "@/components/shared/AppText";
import { RoundButton } from "@/components/shared/RoundButton";
import { Colors, Theme, useTheme } from "@/theme";
import { useSafeRouter } from "@/hooks/useSafeRouter";

export default function ExplainerAiEstimation() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);
  const router = useSafeRouter();
  const { t } = useTranslation();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const sections = [
    {
      key: "text",
      Icon: Pencil,
      title: t("explainer.aiEstimation.sections.textInput.title"),
      bullets: [
        t("explainer.aiEstimation.sections.textInput.bullets.weights"),
        t("explainer.aiEstimation.sections.textInput.bullets.details"),
      ],
    },
    {
      key: "photo",
      Icon: Camera,
      title: t("explainer.aiEstimation.sections.photoScans.title"),
      bullets: [
        t("explainer.aiEstimation.sections.photoScans.bullets.light"),
        t("explainer.aiEstimation.sections.photoScans.bullets.angle"),
        t("explainer.aiEstimation.sections.photoScans.bullets.frame"),
      ],
    },
    {
      key: "audio",
      Icon: Mic,
      title: t("explainer.aiEstimation.sections.audioLogging.title"),
      bullets: [
        t("explainer.aiEstimation.sections.audioLogging.bullets.tone"),
        t("explainer.aiEstimation.sections.audioLogging.bullets.details"),
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.closeButton}>
        <RoundButton
          onPress={handleClose}
          Icon={X}
          variant="tertiary"
          accessibilityLabel={t("explainer.common.close")}
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
          {t("explainer.aiEstimation.title")}
        </AppText>

        {sections.map(({ key, Icon, title, bullets }) => (
          <View style={styles.section} key={key}>
            <View style={styles.sectionHeader}>
              <Icon size={20} color={colors.accent} strokeWidth={1.5} />
              <AppText role="Title2" color="primary">
                {title}
              </AppText>
            </View>
            <View>
              {bullets.map((bullet, index) => (
                <View style={styles.bulletRow} key={`${key}-${index}`}>
                  <AppText
                    role="Body"
                    color="secondary"
                    style={styles.bulletChar}
                  >
                    •
                  </AppText>
                  <AppText
                    role="Body"
                    color="secondary"
                    style={styles.bulletText}
                  >
                    {bullet}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <AppText role="Caption" color="secondary" style={styles.footerText}>
            {t("explainer.aiEstimation.footer")}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme, colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.secondaryBackground,
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
