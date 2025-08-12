import React, { JSX, useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useStyles } from "./Toggle.styles";

export interface ToggleOption<T> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ size: number; color: string }>;
}

export interface ToggleProps<T> {
  value: T;
  options: [ToggleOption<T>, ToggleOption<T>]; // Exactly two options
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

export function Toggle<T>({
  value,
  options,
  onChange,
  accessibilityLabel,
}: ToggleProps<T>): JSX.Element {
  const styles = useStyles();

  // Animation setup for sliding toggle
  const slideAnimation = useSharedValue(value === options[0].value ? 0 : 1);

  // Update animation when value changes
  useEffect(() => {
    slideAnimation.value = withTiming(value === options[0].value ? 0 : 1, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [value, options]);

  // Animated style for sliding indicator
  const animatedSliderStyle = useAnimatedStyle(() => {
    const slideDistance = slideAnimation.value * 101;
    return {
      transform: [
        {
          translateX: `${slideDistance}%`,
        },
      ],
    };
  }, []);

  const renderOption = (option: ToggleOption<T>, isSelected: boolean) => {
    const IconComponent = option.icon;

    return (
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
        <View style={styles.toggleButtonContent}>
          {IconComponent && (
            <IconComponent
              size={20}
              color={
                isSelected
                  ? styles.toggleButtonTextSelected.color
                  : styles.toggleButtonText.color
              }
            />
          )}
          <Text
            style={[
              styles.toggleButtonText,
              isSelected && styles.toggleButtonTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={styles.toggleContainer}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
    >
      {/* Animated sliding background */}
      <Animated.View style={[styles.toggleSlider, animatedSliderStyle]} />

      {/* Option buttons */}
      {options.map((option) => renderOption(option, value === option.value))}
    </View>
  );
}
