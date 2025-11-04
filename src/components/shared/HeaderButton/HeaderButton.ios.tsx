import { useTheme } from "@/theme/ThemeProvider";
import {
  Host,
  Button,
  Image,
  ButtonProps,
  ImageProps,
} from "@expo/ui/swift-ui";
import { clipShape, frame } from "@expo/ui/swift-ui/modifiers";
import { StyleProp, ViewStyle } from "react-native";

const SIZE = 27;

export interface HeaderButtonProps {
  imageProps?: ImageProps;
  buttonProps?: ButtonProps;
  style?: StyleProp<ViewStyle>;
}

export function HeaderButton({
  imageProps,
  buttonProps,
  style,
}: HeaderButtonProps) {
  const { colorScheme } = useTheme();
  return (
    <Host
      matchContents
      colorScheme={colorScheme}
      style={[{ height: SIZE, width: SIZE }, style]}
    >
      <Button
        {...buttonProps}
        variant={buttonProps?.variant || "glass"}
        // modifiers={[clipShape("circle")]}
      >
        <Image
          {...imageProps}
          systemName={imageProps?.systemName || "xmark"}
          color={imageProps?.color || "primary"}
          size={imageProps?.size || 22}
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
