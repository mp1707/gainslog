import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Moon, Palette } from "lucide-react-native";

import { AppText } from "@/components";
import { useTheme, Colors, Theme } from "@/theme";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { SettingRow } from "../SettingRow";

export const AppearanceSection = () => {
  const { colors, theme } = useTheme();
  const router = useSafeRouter();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  return (
    <View style={styles.section}>
      <AppText role="Caption" color="secondary" style={styles.sectionHeader}>
        APPEARANCE
      </AppText>
      <View style={styles.sectionGroup}>
        <SettingRow
          icon={Moon}
          title="Dark mode"
          subtitle="Choose your theme preference."
          accessory="chevron"
          onPress={() => router.push("/settings/dark-mode")}
          backgroundColor={colors.secondaryBackground}
        />
        <View style={styles.separator} />
        <SettingRow
          icon={Palette}
          title="Design"
          subtitle="Customize the app appearance."
          accessory="chevron"
          onPress={() => router.push("/settings/design")}
          backgroundColor={colors.secondaryBackground}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.lg,
      letterSpacing: 0.5,
    },
    sectionGroup: {
      borderRadius: theme.components.cards.cornerRadius,
      overflow: "hidden",
      backgroundColor: colors.secondaryBackground,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.subtleBorder,
      marginLeft: theme.spacing.lg + 24 + theme.spacing.md,
    },
  });
