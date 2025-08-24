import React, { useMemo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "./shared/AppText";
import { useTheme } from "@/providers/ThemeProvider";

export type SemanticType = "calories" | "protein" | "carbs" | "fat";

interface SemanticBadgeProps {
  type: SemanticType;
  label: string;
  style?: ViewStyle;
}

export const SemanticBadge: React.FC<SemanticBadgeProps> = ({
  type,
  label,
  style,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(), []);

  const bg = colors.semanticBadges?.[type]?.background;
  const txt = colors.semanticBadges?.[type]?.text;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg || "rgba(0,0,0,0.08)" },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${label} legend badge`}
    >
      <AppText role="Caption" style={{ color: txt || colors.primaryText }}>
        {label}
      </AppText>
    </View>
  );
};

const createStyles = () =>
  StyleSheet.create({
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      minHeight: 24,
      justifyContent: "center",
      alignItems: "center",
    },
  });
