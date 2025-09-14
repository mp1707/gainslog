import React, { useMemo, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeProvider";
import { AppText } from "@/components";
import type { Colors, Theme } from "@/theme";

export const EmptyFoodLogsState: React.FC = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Snappy spring animation entrance
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 600,
    });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={require("../../../assets/Loopy/LoopyHungry.png")}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Loopy is hungry and waiting for you to log your first meal"
          accessibilityRole="image"
        />
        <AppText style={styles.motivationalText}>Let's log some food!</AppText>
      </Animated.View>
    </View>
  );
};

const createStyles = (colors: Colors, theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 300,
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: 200,
      height: 200,
    },
    motivationalText: {
      ...theme.typography.Headline,
      color: colors.secondaryText,
      textAlign: "center",
    },
  });
};
