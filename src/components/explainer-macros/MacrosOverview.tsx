import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Flame, BicepsFlexed, Droplet, Zap } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { Theme, useTheme } from "@/theme";

export const MacrosOverview: React.FC = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <AppText role="Title1" style={styles.title}>
        Your Macro Strategy
      </AppText>

      <View style={styles.sectionsContainer}>
        {/* Primary Targets Section */}
        <View style={styles.sectionRow}>
          <View style={styles.leftColumn}>
            <View style={styles.doubleIconContainer}>
              <Flame
                size={28}
                color={colors.semantic.calories}
                fill={colors.semantic.calories}
                strokeWidth={1.5}
              />
              <BicepsFlexed
                size={24}
                color={colors.semantic.protein}
                fill={colors.semantic.protein}
                strokeWidth={1.5}
                style={{ marginTop: 2 }}
              />
            </View>
            <AppText role="Caption" color="secondary" style={styles.label}>
              Calories & Protein
            </AppText>
          </View>
          <View style={styles.rightColumn}>
            <AppText role="Title2" color="primary" style={styles.sectionTitle}>
              Primary
            </AppText>
            <AppText role="Body" color="secondary" style={styles.description}>
              Hit these to work towards your loss/gain target and build muscle
            </AppText>
          </View>
        </View>

        {/* Secondary Target Section */}
        <View style={styles.sectionRow}>
          <View style={styles.leftColumn}>
            <View style={styles.iconContainer}>
              <Droplet
                size={28}
                color={colors.semantic.fat}
                fill={colors.semantic.fat}
                strokeWidth={1.5}
              />
            </View>
            <AppText role="Caption" color="secondary" style={styles.label}>
              Fat
            </AppText>
          </View>
          <View style={styles.rightColumn}>
            <AppText role="Title2" color="primary" style={styles.sectionTitle}>
              Secondary
            </AppText>
            <AppText role="Body" color="secondary" style={styles.description}>
              Meet this baseline for optimal hormone balance and nutrient
              absorption
            </AppText>
          </View>
        </View>

        {/* Flexible Filler Section */}
        <View style={styles.sectionRow}>
          <View style={styles.leftColumn}>
            <View style={styles.iconContainer}>
              <Zap
                size={28}
                color={colors.semantic.carbs}
                fill={colors.semantic.carbs}
                strokeWidth={1.5}
              />
            </View>
            <AppText role="Caption" color="secondary" style={styles.label}>
              Carbs
            </AppText>
          </View>
          <View style={styles.rightColumn}>
            <AppText role="Title2" color="primary" style={styles.sectionTitle}>
              Filler
            </AppText>
            <AppText role="Body" color="secondary" style={styles.description}>
              Your body's workout fuel. Consume carbs freely as long as you are
              hitting your calorie and protein goals and fat baseline
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    title: {
      textAlign: "center",
      marginBottom: theme.spacing.xl,
    },
    sectionsContainer: {
      gap: theme.spacing.xl,
    },
    sectionRow: {
      flexDirection: "row",
      gap: theme.spacing.lg,
      alignItems: "flex-start",
    },
    leftColumn: {
      width: 90,
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    iconContainer: {
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
    },
    doubleIconContainer: {
      width: 56,
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs / 2,
    },
    label: {
      textAlign: "center",
    },
    rightColumn: {
      flex: 1,
      gap: theme.spacing.xs,
      paddingTop: 2,
    },
    sectionTitle: {
      marginBottom: theme.spacing.xs / 2,
    },
    description: {
      lineHeight: 20,
    },
  });
