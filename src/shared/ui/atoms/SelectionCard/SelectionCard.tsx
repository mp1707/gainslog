import React from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import type { Icon } from "phosphor-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./SelectionCard.styles";

export interface SelectionCardProps {
  title: string;
  description: string;
  icon: Icon;
  iconColor: string;
  isSelected: boolean;
  onSelect: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  icon: IconComponent,
  iconColor,
  isSelected,
  onSelect,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors, colorScheme);

  const displayIconColor = isSelected ? colors.accent : iconColor;
  const iconWeight = isSelected ? "fill" : "regular";

  // Press animation shared values
  const pressScale = useSharedValue(1);

  // Press animation styles
  const pressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  const handlePressIn = () => {
    pressScale.value = withTiming(0.97, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1.0, { damping: 25, stiffness: 350 });
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || description}
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.card,
          isSelected && styles.selectedCard,
          pressAnimatedStyle,
        ]}
      >
        <View style={styles.iconContainer}>
          <IconComponent
            size={32}
            color={displayIconColor}
            weight={iconWeight}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, isSelected && styles.selectedTitle]}>
            {title}
          </Text>
          <Text style={[styles.description, isSelected && styles.selectedDescription]}>
            {description}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};