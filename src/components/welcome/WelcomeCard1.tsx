import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import { AppText } from "@/components";
import { Card } from "@/components/Card";
import { FoodLog } from "@/types/models";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

interface WelcomeCard1Props {
  width: number;
}

export const WelcomeCard1: React.FC<WelcomeCard1Props> = ({ width }) => {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const mockFoodLog = getMockFoodLog(t);

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <AppText role="Title2" color="primary" style={styles.title}>
            {t("welcome.card1.title")}
          </AppText>
          <AppText role="Body" color="secondary" style={styles.subtitle}>
            {t("welcome.card1.subtitle")}
          </AppText>
        </View>

        <View style={styles.cardContainer}>
          <StaticLogCardPreview log={mockFoodLog} />
        </View>
      </View>
    </View>
  );
};

// Simplified static version of LogCard for welcome screen preview
const StaticLogCardPreview: React.FC<{ log: FoodLog }> = ({ log }) => {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createLogCardStyles(colors, theme),
    [colors, theme]
  );

  return (
    <Card elevated={true} style={styles.card}>
      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          <AppText role="Headline" color="primary" style={styles.logTitle}>
            {log.title}
          </AppText>
          <View style={styles.componentsList}>
            {log.foodComponents.slice(0, 2).map((component, index) => (
              <AppText
                key={index}
                role="Subhead"
                color="secondary"
                style={styles.componentText}
                numberOfLines={1}
              >
                {component.name}
              </AppText>
            ))}
          </View>
        </View>

        <View style={styles.rightSection}>
          <View style={styles.nutritionList}>
            {[
              {
                key: "calories",
                value: Math.round(log.calories),
                color: colors.semantic.calories,
                translationKey: "welcome.card1.nutrients.calories",
              },
              {
                key: "protein",
                value: Math.round(log.protein),
                color: colors.semantic.protein,
                translationKey: "welcome.card1.nutrients.protein",
              },
              {
                key: "carbs",
                value: Math.round(log.carbs),
                color: colors.semantic.carbs,
                translationKey: "welcome.card1.nutrients.carbs",
              },
              {
                key: "fat",
                value: Math.round(log.fat),
                color: colors.semantic.fat,
                translationKey: "welcome.card1.nutrients.fat",
              },
            ].map((item) => (
              <View key={item.key} style={styles.nutritionRow}>
                <View
                  style={[styles.nutritionDot, { backgroundColor: item.color }]}
                />
                <AppText role="Subhead" color="primary">
                  {t(item.translationKey, { value: item.value })}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Card>
  );
};

type Theme = ReturnType<typeof useTheme>["theme"];
type Colors = ReturnType<typeof useTheme>["colors"];

const getMockFoodLog = (t: TFunction<"translation">): FoodLog => ({
  id: "welcome-mock-1",
  title: t("welcome.card1.mockLog.title"),
  calories: 630,
  protein: 44,
  carbs: 86,
  fat: 16,
  logDate: new Date().toISOString().split("T")[0],
  createdAt: Date.now().toString(),
  foodComponents: [
    {
      name: t("welcome.card1.mockLog.components.chicken"),
      amount: 150,
      unit: "g",
    },
    {
      name: t("welcome.card1.mockLog.components.rice"),
      amount: 200,
      unit: "g",
    },
    {
      name: t("welcome.card1.mockLog.components.sauce"),
      amount: 100,
      unit: "g",
    },
  ],
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
    },
    content: {
      width: "100%",
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      gap: theme.spacing.lg,
    },
    textContainer: {
      alignItems: "center",
      gap: theme.spacing.sm,
      minHeight: 80, // Ensure consistent title area height
    },
    title: {
      textAlign: "center",
    },
    subtitle: {
      textAlign: "center",
      maxWidth: "80%",
    },
    cardContainer: {
      width: "100%",
    },
  });

const createLogCardStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.lg,
    },
    contentContainer: {
      flexDirection: "row",
      gap: theme.spacing.md,
    },
    leftSection: {
      flex: 1,
      maxWidth: "70%",
      gap: theme.spacing.sm,
    },
    logTitle: {
      lineHeight: 24,
    },
    componentsList: {
      gap: theme.spacing.xs / 2,
    },
    componentText: {
      lineHeight: 18,
    },
    rightSection: {
      minWidth: "35%",
      justifyContent: "center",
    },
    nutritionList: {
      gap: theme.spacing.sm,
    },
    nutritionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    nutritionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });
