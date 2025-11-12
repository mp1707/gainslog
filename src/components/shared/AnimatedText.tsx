import React, { useMemo } from "react";
import { TextInput, StyleSheet, TextStyle } from "react-native";
import Animated, {
  useAnimatedProps,
  SharedValue,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedTextProps {
  value: SharedValue<number>;
  role?: "Title1" | "Title2" | "Headline" | "Body" | "Subhead" | "Caption";
  color?: "primary" | "secondary";
  style?: TextStyle;
}

/**
 * AnimatedText component that updates text on UI thread without JS bridging
 *
 * Performance benefits:
 * - Zero JS thread impact during animations
 * - No React re-renders for value changes
 * - Smooth 60fps updates entirely on UI thread
 *
 * Usage:
 * ```tsx
 * const animatedValue = useSharedValue(0);
 * animatedValue.value = withTiming(100, { duration: 1500 });
 *
 * <AnimatedText value={animatedValue} role="Headline" />
 * ```
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  value,
  role = "Body",
  color = "primary",
  style: customStyle,
}) => {
  const { colors, theme } = useTheme();

  // Animated props that update on UI thread
  const animatedProps = useAnimatedProps(() => {
    const rounded = Math.round(value.value);
    return {
      text: rounded.toString(),
      // We must return defaultValue to prevent React warning
      defaultValue: rounded.toString(),
    };
  });

  const textColor = useMemo(() => {
    switch (color) {
      case "primary":
        return colors.primaryText;
      case "secondary":
        return colors.secondaryText;
      default:
        return colors.primaryText;
    }
  }, [colors, color]);

  const textStyle = useMemo(() => {
    switch (role) {
      case "Title1":
        return theme.typography.Title1;
      case "Title2":
        return theme.typography.Title2;
      case "Headline":
        return theme.typography.Headline;
      case "Body":
        return theme.typography.Body;
      case "Subhead":
        return theme.typography.Subhead;
      case "Caption":
        return theme.typography.Caption;
      default:
        return theme.typography.Body;
    }
  }, [theme.typography, role]);

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      editable={false}
      style={[
        styles.text,
        textStyle,
        { color: textColor },
        customStyle,
      ]}
      // Disable all interactive features to make it behave like Text
      scrollEnabled={false}
      showSoftInputOnFocus={false}
      caretHidden={true}
      contextMenuHidden={true}
      // Ensure no pointer events
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  text: {
    // Remove TextInput default styling
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    // Disable selection
    userSelect: "none",
    // Fix flexbox layout to prevent text overlap
    width: "auto",
    flexShrink: 1,
    minWidth: 0,
  },
});
