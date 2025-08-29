import { useTheme } from "@/theme/ThemeProvider";
import React from "react";
import { Text, TextProps, TextStyle } from "react-native";

export type TypographyRole =
  | "Title1"
  | "Title2"
  | "Headline"
  | "Body"
  | "Subhead"
  | "Caption"
  | "Button";

interface AppTextProps extends Omit<TextProps, "role"> {
  role?: TypographyRole;
  color?: "primary" | "secondary" | "accent" | "white" | "disabled";
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  role = "Body",
  color,
  style,
  children,
  ...props
}) => {
  const { colors, theme } = useTheme();

  // Get typography style for the role
  const typographyStyle = theme.typography[role];

  // Determine text color
  let textColor: string;
  if (color) {
    switch (color) {
      case "primary":
        textColor = colors.primaryText;
        break;
      case "secondary":
        textColor = colors.secondaryText;
        break;
      case "accent":
        textColor = colors.accent;
        break;
      case "white":
        textColor = colors.white;
        break;
      case "disabled":
        textColor = colors.disabledText;
        break;
      default:
        textColor = colors.primaryText;
    }
  } else {
    // Default color based on role
    if (role === "Subhead" || role === "Caption") {
      textColor = colors.secondaryText;
    } else {
      textColor = colors.primaryText;
    }
  }

  const textStyle: TextStyle = {
    fontFamily: typographyStyle.fontFamily,
    fontSize: typographyStyle.fontSize,
    fontWeight: typographyStyle.fontWeight,
    color: textColor,
  };

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};
