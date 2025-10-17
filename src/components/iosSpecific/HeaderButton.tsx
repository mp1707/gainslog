import {
  Host,
  Button,
  Image,
  ButtonProps,
  ImageProps,
} from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import { theme } from "@/theme";
import { StyleProp, ViewStyle } from "react-native";

const SIZE = theme.typography.Title2.fontSize * 1.5;

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
  return (
    <Host matchContents style={[style]}>
      <Button
        {...buttonProps}
        variant={buttonProps?.variant || "glass"}
        controlSize="regular"
      >
        <Image
          {...imageProps}
          systemName={imageProps?.systemName || "xmark"}
          color={imageProps?.color || "primary"}
          size={imageProps?.size || theme.typography.Title2.fontSize}
          modifiers={[
            frame({ height: SIZE }),
            ...(imageProps?.modifiers || []),
          ]}
        />
      </Button>
    </Host>
  );
}
