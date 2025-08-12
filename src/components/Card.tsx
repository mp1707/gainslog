import React from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import { useTheme } from "../providers/ThemeProvider";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean; // disable expensive shadows when false
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding,
  elevated = true,
  ...props
}) => {
  const { theme, colorScheme } = useTheme();

  const cardStyles = theme.getComponentStyles(colorScheme);
  const cardConfig = cardStyles.cards;

  const cardStyle: ViewStyle = {
    backgroundColor: cardConfig.backgroundColor,
    borderRadius: cardConfig.cornerRadius,
    padding: padding ?? theme.spacing.md,
    // Shadow styles
    shadowColor: elevated ? cardConfig.shadowColor : undefined,
    shadowOffset: elevated ? cardConfig.shadowOffset : undefined,
    shadowOpacity: elevated ? cardConfig.shadowOpacity : 0,
    shadowRadius: elevated ? cardConfig.shadowRadius : 0,
    elevation: elevated ? cardConfig.elevation : 0,
  };

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};
