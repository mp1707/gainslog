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
  options: [ToggleOption<T>, ToggleOption<T>, ToggleOption<T>]; // Exactly three options
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
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [value, options]);

  const animatedSliderStyle = useAnimatedStyle(() => {
    if (containerWidth === 0) return {};

    const containerPadding = 2; // must match styles
    const innerWidth = containerWidth - containerPadding * 2;
    const segmentWidth = innerWidth / 3;

    return {
      left: containerPadding + slideAnimation.value * segmentWidth,
      width: segmentWidth,
    };
  }, [containerWidth]);

  const renderOption = (option: ToggleOption<T>, isSelected: boolean) => (
    <TouchableOpacity
      key={String(option.value)}
      onPress={() => {
        if (!isSelected) {
          Haptics.selectionAsync();
          onChange(option.value);
        }
      }}
      style={styles.toggleButton}
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
