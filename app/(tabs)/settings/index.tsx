import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Constants from "expo-constants";

import { AppText } from "@/components";
import { useTheme, Colors, Theme, ColorScheme } from "@/theme";
import { ProSection } from "./components/ProSection";
import { AppearanceSection } from "./components/AppearanceSection";
import { GoalsSection } from "./components/GoalsSection";
import { DeveloperSection } from "./components/DeveloperSection";
import { AboutSection } from "./components/AboutSection";
import { useAppStore } from "@/store/useAppStore";

export default function SettingsScreen() {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, theme, colorScheme),
    [colors, theme, colorScheme]
  );
  const { isPro } = useAppStore();

  const version = Constants.expoConfig?.version ?? "1.0.0";
  const build =
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode ??
    Constants.nativeBuildVersion ??
    "";
  const versionLabel = build
    ? `Version ${version} · Build ${build}`
    : `Version ${version}`;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!isPro && <ProSection />}
        <AppearanceSection />
        <GoalsSection />
        <AboutSection />
        <DeveloperSection />
        <View style={styles.footer}>
          <AppText role="Caption" color="secondary" style={styles.footerText}>
            {versionLabel}
          </AppText>
          <AppText role="Caption" color="secondary" style={styles.footerText}>
            Comment: paywall
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors, theme: Theme, colorScheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colorScheme === "dark"
          ? colors.primaryBackground
          : colors.tertiaryBackground,
    },
    scrollContent: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
    },
    footer: {
      marginTop: theme.spacing.xl,
      alignItems: "center",
    },
    footerText: {
      textAlign: "center",
    },
  });
