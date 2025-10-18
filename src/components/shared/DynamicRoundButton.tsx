import React, { useMemo } from "react";
import { ViewStyle } from "react-native";
import { Host, Button, Image, ImageProps } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { LucideIcon } from "lucide-react-native";

import { useTheme } from "@/theme";
import { RoundButton } from "./RoundButton/RoundButton";

export type DynamicRoundButtonVariant = "primary" | "secondary" | "tertiary" | "red";

interface DynamicRoundButtonProps {
  // Variant
  variant?: DynamicRoundButtonVariant;

  // Icons
  systemIcon: string; // SF Symbol for Expo UI Button
  legacyIcon: LucideIcon; // Lucide icon for RoundButton fallback

  // Interaction
  onPress: () => void;
  disabled?: boolean;

  // Sizing
  controlSize?: "regular" | "small" | "large";
  iconSize?: number; // Used for RoundButton

  // Host props (for Expo UI Button)
  withHost?: boolean;
  hostStyle?: ViewStyle;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const DynamicRoundButton: React.FC<DynamicRoundButtonProps> = ({
  variant = "secondary",
  controlSize = "regular",
  onPress,
  disabled = false,
  systemIcon,
  legacyIcon,
  iconSize = 20,
  withHost = true,
  hostStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme, colors } = useTheme();

  const defaultIconPadding = useMemo(
    () => ({
      vertical: theme.spacing.xs * 1.5,
      horizontal: 0,
    }),
    [theme.spacing.xs]
  );

  const isGlassAvailable = isLiquidGlassAvailable();

  // Variant mapping for Expo UI Button
  const getExpoUIConfig = (
    buttonVariant: DynamicRoundButtonVariant
  ): { variant: "glass" | "glassProminent"; color?: string; iconColor?: string } => {
    switch (buttonVariant) {
      case "primary":
        return {
          variant: "glassProminent",
          color: colors.accent,
          iconColor: colors.black,
        };
      case "red":
        return {
          variant: "glassProminent",
          color: colors.recording,
          iconColor: colors.white,
        };
      case "secondary":
      case "tertiary":
      default:
        return {
          variant: "glass",
        };
    }
  };

  // Variant mapping for RoundButton
  const getRoundButtonVariant = (
    buttonVariant: DynamicRoundButtonVariant
  ): "primary" | "secondary" | "tertiary" | "red" => {
    return buttonVariant;
  };

  // Render Expo UI Button (glass effect)
  if (isGlassAvailable) {
    const expoConfig = getExpoUIConfig(variant);

    const buttonContent = (
      <Button
        variant={expoConfig.variant}
        controlSize={controlSize}
        color={expoConfig.color}
        onPress={onPress}
        disabled={disabled}
      >
        <Image
          modifiers={[padding(defaultIconPadding)]}
          systemName={systemIcon as ImageProps["systemName"]}
          color={expoConfig.iconColor}
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
  }

  // Render RoundButton (legacy fallback)
  return (
    <RoundButton
      Icon={legacyIcon}
      variant={getRoundButtonVariant(variant)}
      iconSize={iconSize}
      iconStrokeWidth={2.5}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    />
  );
};
