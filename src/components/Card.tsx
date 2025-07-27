import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding,
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
    shadowColor: cardConfig.shadowColor,
    shadowOffset: cardConfig.shadowOffset,
    shadowOpacity: cardConfig.shadowOpacity,
    shadowRadius: cardConfig.shadowRadius,
    elevation: cardConfig.elevation,
  };

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};