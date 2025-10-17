import React, { useMemo } from "react";
import { ViewStyle } from "react-native";
import { Host, Button, Image } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";

import { useTheme } from "@/theme";

interface IOSButtonProps {
  // Button props
  variant?: "glass" | "glassProminent";
  controlSize?: "regular" | "small" | "large";
  buttonColor?: string;
  onPress: () => void;

  // Icon props
  systemIcon: string;
  iconColor?: string;
  iconPadding?: { vertical?: number; horizontal?: number };

  // Host props
  withHost?: boolean;
  hostStyle?: ViewStyle;
}

export const IOSButton: React.FC<IOSButtonProps> = ({
  variant = "glass",
  controlSize = "regular",
  buttonColor,
  onPress,
  systemIcon,
  iconColor,
  iconPadding,
  withHost = true,
  hostStyle,
}) => {
  const { theme } = useTheme();

  const defaultIconPadding = useMemo(
    () => ({
      vertical: theme.spacing.xs * 1.5,
      horizontal: 0,
    }),
    [theme.spacing.xs]
  );

  const finalIconPadding = {
    ...defaultIconPadding,
    ...iconPadding,
  };

  const buttonContent = (
    <Button
      variant={variant}
      controlSize={controlSize}
      color={buttonColor}
      onPress={onPress}
    >
      <Image
        modifiers={[padding(finalIconPadding)]}
        systemName={systemIcon}
        color={iconColor}
      />
    </Button>
  );

  if (!withHost) {
    return buttonContent;
  }

  return (
    <Host matchContents style={hostStyle}>
      {buttonContent}
    </Host>
  );
};
