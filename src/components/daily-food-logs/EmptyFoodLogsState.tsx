import React, { useMemo } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { AppText } from "@/components";
import type { Colors, Theme } from "@/theme";

export const EmptyFoodLogsState: React.FC = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Image
          source={require("../../../assets/Loopy/LoopyHungry.png")}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Loopy is hungry and waiting for you to log your first meal"
          accessibilityRole="image"
        />

        <AppText style={styles.motivationalText}>Let's log some food!</AppText>
      </View>
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
    contentContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
    },
    image: {
      width: 150,
      height: 150,
    },
    motivationalText: {
      ...theme.typography.Headline,
      color: colors.secondaryText,
      textAlign: "center",
    },
  });
};
