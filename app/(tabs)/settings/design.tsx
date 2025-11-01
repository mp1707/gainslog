import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { AppText } from "@/components";
import { AnimatedPressable } from "@/components/shared/AnimatedPressable";
import { useTheme, Colors, Theme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export default function DesignScreen() {
  const { colors, theme } = useTheme();
  const { safeBack } = useNavigationGuard();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Design",
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
          headerTintColor: colors.primaryText,
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <AppText role="Body" color="secondary" style={styles.placeholder}>
            Coming soon
          </AppText>
        </View>
      </View>
    </>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    backButton: {
      marginLeft: -8,
      padding: 8,
    },
    placeholder: {
      textAlign: "center",
    },
  });
