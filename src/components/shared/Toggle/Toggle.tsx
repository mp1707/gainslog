// Toggle.tsx
import React, { JSX, useEffect, useState } from "react";
import { View, TouchableOpacity, Text, LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { createStyles } from "./Toggle.styles";

export interface ToggleOption<T> {
  value: T;
  label: string;
}

export interface ToggleProps<T> {
  value: T;
  options: ToggleOption<T>[]; // Flexible number of options
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

export function Toggle<T>({
  value,
  options,
  onChange,
  accessibilityLabel,
}: ToggleProps<T>): JSX.Element {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors, theme, colorScheme);

  const currentIndex = options.findIndex((o) => o.value === value);
  const slideAnimation = useSharedValue(currentIndex >= 0 ? currentIndex : 0);

  const [containerWidth, setContainerWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  useEffect(() => {
    const newIndex = options.findIndex((o) => o.value === value);
    slideAnimation.value = withTiming(newIndex, {
      duration: 150,
      easing: Easing.inOut(Easing.quad),
    });
  }, [value, options]);

  const animatedSliderStyle = useAnimatedStyle(() => {
    if (containerWidth === 0) return {};

    const containerPadding = 2; // must match styles
    const innerWidth = containerWidth - containerPadding * 3;
    const segmentWidth = innerWidth / options.length;

    return {
      left: containerPadding + slideAnimation.value * segmentWidth,
      width: segmentWidth,
    };
  }, [containerWidth, options.length]);

  const renderOption = (option: ToggleOption<T>, isSelected: boolean) => (
    <TouchableOpacity
      key={String(option.value)}
      onPress={() => {
        if (!isSelected) {
          Haptics.impactAsync(theme.interactions.haptics.light);
          onChange(option.value);
        }
      }}
      style={styles.toggleButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={`Select ${option.label}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={[
          styles.toggleButtonText,
          isSelected && styles.toggleButtonTextSelected,
        ]}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={styles.toggleContainer}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      onLayout={onLayout}
    >
      <Animated.View style={[styles.toggleSlider, animatedSliderStyle]} />
      {options.map((option) => renderOption(option, value === option.value))}
    </View>
  );
}
