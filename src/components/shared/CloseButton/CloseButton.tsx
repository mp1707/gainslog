import React from "react";
import { X } from "lucide-react-native";
import { useTheme } from "@/theme";
import { Button } from "../ButtonDeprecated";
import styles from "toastify-react-native/components/styles";

interface CloseButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  size?: number;
  style?: any;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onPress,
  accessibilityLabel = "Close",
  accessibilityHint = "Close this screen",
  style,
}) => {
  const { colors } = useTheme();

  return (
    <Button
      onPress={onPress}
      variant="tertiary"
      icon={<X size={18} color={colors.secondaryText} />}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      grow={false}
      style={style}
    />

    // <Pressable
    //   style={({ pressed }) => [
    //     styles.button,
    //     pressed && styles.buttonPressed,
    //     style,
    //   ]}
    //   onPress={onPress}
    //   accessibilityRole="button"
    //   accessibilityLabel={accessibilityLabel}
    //   accessibilityHint={accessibilityHint}
    //   hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    // >
    //   <CircleX
    //     size={size}
    //     color={colors.secondaryText}
    //     strokeWidth={0.5}
    //   />
    // </Pressable>
  );
};
