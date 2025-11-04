import { useTheme } from "@/theme/ThemeProvider";
import {
  Host,
  Button,
  Image,
  ButtonProps,
  ImageProps,
} from "@expo/ui/swift-ui";
import { clipShape, frame } from "@expo/ui/swift-ui/modifiers";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { StyleProp, ViewStyle } from "react-native";

const SIZE = 27;

export interface HeaderButtonProps {
  imageProps?: ImageProps;
  buttonProps?: ButtonProps;
  style?: StyleProp<ViewStyle>;
  variant?: "regular" | "prominent";
}

export function HeaderButton({
  imageProps,
  buttonProps,
  style,
  variant = "regular",
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
        {...buttonProps}
        color={buttonProps?.color || colors.secondaryBackground}
        variant={
          hasLiquidGlass
            ? variant === "prominent"
              ? "glassProminent"
              : "glass"
            : "borderedProminent"
        }
        controlSize={hasLiquidGlass ? "large" : "regular"}
        modifiers={hasLiquidGlass ? [] : [clipShape("circle")]}
      >
        <Image
          {...imageProps}
          systemName={imageProps?.systemName || "xmark"}
          color={imageProps?.color || "primary"}
          size={hasLiquidGlass ? undefined : 18}
          modifiers={[
            clipShape("circle"),
            frame({ height: 22, width: 12 }),
            ...(imageProps?.modifiers || []),
          ]}
        />
      </Button>
    </Host>
  );
}
