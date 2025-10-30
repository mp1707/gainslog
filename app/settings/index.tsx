import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import Constants from "expo-constants";

import { AppText } from "@/components";
import { AnimatedPressable } from "@/components/shared/AnimatedPressable";
import { useTheme, Colors, Theme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { ProSection } from "./components/ProSection";
import { AppearanceSection } from "./components/AppearanceSection";
import { GoalsSection } from "./components/GoalsSection";
import { DeveloperSection } from "./components/DeveloperSection";
import { AboutSection } from "./components/AboutSection";
import { useAppStore } from "@/store/useAppStore";

export default function SettingsScreen() {
  const { colors, theme } = useTheme();
  const { safeBack } = useNavigationGuard();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
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
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLargeTitle: true,
          headerTitle: "Settings",
          headerLeft: () => (
            <AnimatedPressable
              onPress={safeBack}
              hapticIntensity="light"
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ChevronLeft size={28} color={colors.accent} strokeWidth={2} />
            </AnimatedPressable>
          ),
          headerStyle: {
            backgroundColor: colors.primaryBackground,
          },
          headerLargeStyle: {
            backgroundColor: colors.primaryBackground,
          },
          headerTintColor: colors.primaryText,
          headerLargeTitleStyle: {
            color: colors.primaryText,
          },
        }}
      />
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
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    backButton: {
      marginLeft: -8,
      padding: 8,
    },
    footer: {
      marginTop: theme.spacing.xl,
      alignItems: "center",
    },
    footerText: {
      textAlign: "center",
    },
  });
