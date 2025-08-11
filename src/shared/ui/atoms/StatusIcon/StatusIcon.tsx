import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

type StatusIconType = "completed" | "next";

export type StatusIconProps = {
  type: StatusIconType;
  size?: number;
  accessibilityLabel?: string;
};

export const StatusIcon: React.FC<StatusIconProps> = ({
  type,
  size = 22,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors, size), [colors, size]);

  const isCompleted = type === "completed";
  const label = accessibilityLabel || (isCompleted ? "Completed" : "Next step");

  return (
    <View
      style={[styles.base, isCompleted ? styles.completed : styles.next]}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.iconText,
          isCompleted ? styles.completedText : styles.nextText,
        ]}
      >
        {isCompleted ? "✓" : "?"}
      </Text>
    </View>
  );
};

const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  size: number
) =>
  StyleSheet.create({
    base: {
      width: size,
      height: size,
      borderRadius: size / 2,
      alignItems: "center",
      justifyContent: "center",
    },
    iconText: {
      fontSize: Math.round(size * 0.64),
      fontWeight: "700",
      lineHeight: Math.round(size * 0.73),
    },
    completed: {
      backgroundColor: colors.success,
    },
    completedText: {
      color: colors.primaryBackground,
    },
    next: {
      backgroundColor: colors.disabledBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nextText: {
      color: colors.secondaryText,
    },
  });
