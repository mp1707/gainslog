import React, { useMemo } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "./shared/AppText";
import { useTheme } from "@/theme";

export type NutrientType = "calories" | "protein" | "carbs" | "fat";

interface FilterBadgeProps {
  type: NutrientType;
  label: string;
  active: boolean;
  onToggle: (type: NutrientType) => void;
  style?: ViewStyle;
}

export const FilterBadge: React.FC<FilterBadgeProps> = ({
  type,
  label,
  active,
  onToggle,
  style,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const bgActive = colors.semanticBadges?.[type]?.background;
  const textActive = colors.semanticBadges?.[type]?.text;
  const bgInactive = colors.disabledBackground;
  const textInactive = colors.secondaryText;

  return (
    <Pressable
      onPress={() => onToggle(type)}
      accessibilityRole="button"
      accessibilityLabel={`${label} filter`}
      accessibilityState={{ disabled: !active }}
      accessibilityHint={
        active
          ? "Active. Tap to hide this metric."
          : "Inactive. Tap to show this metric."
      }
      style={[
        styles.badge,
        { backgroundColor: active ? bgActive : bgInactive },
        style,
      ]}
    >
      <AppText
        role="Caption"
        style={{
          color: active ? textActive || colors.primaryText : textInactive,
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.sm,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
    },
  });
