import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import Constants from "expo-constants";

import { AppText } from "@/components";
import { RoundButton } from "@/components/shared/RoundButton/RoundButton";
import { useTheme, Colors, Theme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { ProSection } from "./components/ProSection";
import { AppearanceSection } from "./components/AppearanceSection";
import { GoalsSection } from "./components/GoalsSection";
import { DeveloperSection } from "./components/DeveloperSection";
import { AboutSection } from "./components/AboutSection";
import { useAppStore } from "@/store/useAppStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { colors, theme } = useTheme();
  const { safeBack } = useNavigationGuard();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { isPro } = useAppStore();
  const insets = useSafeAreaInsets();

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
      <RoundButton
        Icon={ChevronLeft}
        variant="tertiary"
        onPress={safeBack}
        accessibilityLabel="Go back"
        style={[styles.backButton, { top: insets.top }]}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AppText role="Title2" style={styles.header}>
          Settings
        </AppText>
        {!isPro && <ProSection />}
        <AppearanceSection />
        <GoalsSection />
        <AboutSection />
        <DeveloperSection />
        <View style={styles.footer}>
          <AppText role="Caption" color="secondary" style={styles.footerText}>
            {versionLabel}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    header: {
      flex: 1,
      textAlign: "center",
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    backButton: {
      position: "absolute",
      left: theme.spacing.md,
      zIndex: 15,
    },
    headerSpacer: {
      width: theme.spacing.lg + theme.spacing.sm,
    },
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
      // paddingTop: theme.spacing.xxl,
    },
    footer: {
      marginTop: theme.spacing.xl,
      alignItems: "center",
    },
    footerText: {
      textAlign: "center",
    },
  });
