import React from "react";
import { View, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { AppText } from "src/components";

export type AccordionItemProps = {
  title: string;
  subtitle?: string;
  accessibilityLabel: string;
  rightAccessory?: React.ReactNode;
  disabled?: boolean;
  expanded: boolean;
  onToggle: () => void;
  isFirst?: boolean;
  contentContainerStyle?: ViewStyle;
  children: React.ReactNode;
};

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  accessibilityLabel,
  rightAccessory,
  disabled = false,
  expanded,
  onToggle,
  isFirst = false,
  contentContainerStyle,
  children,
}) => {
  const { colors, theme } = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: "transparent",
    opacity: disabled ? 0.5 : 1,
  };

  const headerStyle: ViewStyle = {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: colors.secondaryBackground,
    borderTopWidth: isFirst ? 0 : 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: colors.secondaryBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...(contentContainerStyle || {}),
  };

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (disabled) return;
          onToggle();
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded, disabled }}
        accessibilityLabel={accessibilityLabel}
        style={headerStyle}
      >
        <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
          <AppText role="Headline" style={{ marginBottom: 4 }}>
            {title}
          </AppText>
          {!!subtitle && (
            <AppText role="Caption" color="secondary">
              {subtitle}
            </AppText>
          )}
        </View>
        {rightAccessory}
      </TouchableOpacity>

      {expanded && <View style={contentStyle}>{children}</View>}
    </View>
  );
};
