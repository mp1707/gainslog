import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { AppText } from "../../shared/AppText";
import { ProgressBar } from "@/components/monthly-food-logs/DailySummaryCard/ProgressBar";
import { useTheme } from "@/providers/ThemeProvider";

interface ProgressRowProps {
  label: string;
  value: number; // 0..100+ actual value
  color: string;
  icon?: React.ReactNode;
  animatedProgress?: SharedValue<number>;
}

export const ProgressRow: React.FC<ProgressRowProps> = React.memo(
  ({ label, value, color, icon, animatedProgress }) => {
    const { colors, theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const displayPercent = Math.round(value);
    const lbl = (
      <View style={styles.labelWrap}>
        {icon}
        <AppText role="Subhead" color="secondary">
          {label}
        </AppText>
      </View>
    );

    return (
      <View style={styles.row}>
        <View style={styles.left}>{lbl}</View>
        <View style={styles.middle}>
          <ProgressBar
            value={value}
            color={color}
            trackColor={colors.disabledBackground}
            height={8}
            borderRadius={4}
            accessibilityLabel={`${label} progress`}
            animatedProgress={animatedProgress}
          />
        </View>
        <View style={styles.right}>
          <AppText role="Body" style={{ color: colors.primaryText }}>
            {displayPercent}%
          </AppText>
        </View>
      </View>
    );
  }
);

const createStyles = (theme: any) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    left: {
      width: 72,
    },
    middle: {
      flex: 1,
    },
    right: {
      width: 48,
      alignItems: "flex-end",
    },
    labelWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
  });
