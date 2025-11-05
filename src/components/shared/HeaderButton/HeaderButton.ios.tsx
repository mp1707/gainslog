import { useTheme } from "@/theme/ThemeProvider";
import {
  Host,
  Button,
  Image,
  ButtonProps,
  ImageProps,
} from "@expo/ui/swift-ui";
import { clipShape, frame, padding } from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { StyleProp, ViewStyle } from "react-native";

const SIZE = 27;

export interface HeaderButtonProps {
  imageProps?: ImageProps;
  buttonProps?: ButtonProps;
  style?: StyleProp<ViewStyle>;
  variant?: "regular" | "colored";
  size?: "regular" | "large";
}

export function HeaderButton({
  imageProps,
  buttonProps,
  style,
  variant = "regular",
  size = "regular",
}: HeaderButtonProps) {
  const { colorScheme } = useTheme();
  const hasLiquidGlass = isLiquidGlassAvailable();
  const { colors } = useTheme();

  return (
    <Host
      matchContents
      colorScheme={colorScheme}
      style={[{ height: SIZE, width: SIZE }, style]}
    >
      <Button
        color={buttonProps?.color || colors.secondaryBackground}
        variant={
          hasLiquidGlass
            ? variant === "colored"
              ? "glassProminent"
              : "glass"
            : "borderedProminent"
        }
        controlSize={hasLiquidGlass ? size : "regular"}
        modifiers={hasLiquidGlass ? [] : [clipShape("circle")]}
        {...buttonProps}
      >
        <Image
          {...imageProps}
          systemName={imageProps?.systemName || "xmark"}
          color={imageProps?.color || "primary"}
          size={size === "large" && hasLiquidGlass ? 24 : 18}
          modifiers={[
            padding({ all: 30 }),
            frame({ height: 30, width: 20 }),
            ...(imageProps?.modifiers || []),
          ]}
        />
      </Button>
    </Host>
  );
}
