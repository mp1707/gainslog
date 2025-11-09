import React, { useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "@/theme";
import { AppText } from "@/components";
import { DashboardRing } from "@/components/shared/ProgressRings/DashboardRing";
import { Flame, BicepsFlexed } from "lucide-react-native";
import { useTranslation } from "react-i18next";

// Static mock data for the progress rings
const MOCK_DATA = {
  calories: {
    total: 1640,
    target: 2267,
    percentage: 72,
  },
  protein: {
    total: 88,
    target: 112,
    percentage: 79,
  },
};

interface WelcomeCard2Props {
  width: number;
}

export const WelcomeCard2: React.FC<WelcomeCard2Props> = ({ width }) => {
  const { colors, theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Calculate responsive ring sizes - bigger rings for welcome screen
  const containerWidth = width - theme.spacing.pageMargins.horizontal * 2;
  const ringSize = Math.min(
    (containerWidth - theme.spacing.lg) / 2,
    screenWidth * 0.42
  );
  const strokeWidth = Math.max(ringSize * 0.12, 14);

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <AppText role="Title2" color="primary" style={styles.title}>
            {t("welcome.card2.title")}
          </AppText>
          <AppText role="Body" color="secondary" style={styles.subtitle}>
            {t("welcome.card2.subtitle")}
          </AppText>
        </View>

        <View style={styles.ringsContainer}>
          {/* Calories Ring */}
          <View style={styles.ringWrapper}>
            <DashboardRing
              label={t("nutrients.calories.label")}
              displayUnit={t("nutrients.calories.unitShort")}
              detailUnit=""
              showDetail={false}
              percentage={MOCK_DATA.calories.percentage}
              color={colors.semantic.calories}
              trackColor={colors.semanticSurfaces.calories}
              textColor={colors.primaryText}
              displayValue={MOCK_DATA.calories.total}
              detailValue={`${t("nutrients.of")} ${MOCK_DATA.calories.target}`}
              strokeWidth={strokeWidth}
              size={ringSize}
              Icon={Flame}
              skipAnimation={true}
            />
            <AppText role="Subhead" color="secondary" style={styles.ringLabel}>
              {t("nutrients.calories.label")}
            </AppText>
          </View>

          {/* Protein Ring */}
          <View style={styles.ringWrapper}>
            <DashboardRing
              label={t("nutrients.protein.label")}
              displayUnit={t("nutrients.protein.unit")}
              detailUnit=""
              showDetail={false}
              percentage={MOCK_DATA.protein.percentage}
              color={colors.semantic.protein}
              trackColor={colors.semanticSurfaces.protein}
              textColor={colors.primaryText}
              displayValue={MOCK_DATA.protein.total}
              detailValue={`${t("nutrients.of")} ${MOCK_DATA.protein.target}`}
              strokeWidth={strokeWidth}
              size={ringSize}
              Icon={BicepsFlexed}
              smallIcon={true}
              skipAnimation={true}
            />
            <AppText role="Subhead" color="secondary" style={styles.ringLabel}>
              {t("nutrients.protein.label")}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

type Theme = ReturnType<typeof useTheme>["theme"];

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
      gap: theme.spacing.xs,
    },
    textContainer: {
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    title: {
      textAlign: "center",
    },
    subtitle: {
      textAlign: "center",
      maxWidth: "80%",
    },
    ringsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    ringWrapper: {
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    ringLabel: {
      textAlign: "center",
    },
  });
