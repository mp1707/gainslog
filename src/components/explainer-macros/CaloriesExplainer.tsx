import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button/Button";
import { Theme, useTheme } from "@/theme";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { useSafeRouter } from "@/hooks/useSafeRouter";

interface CaloriesExplainerProps {
  total?: number;
  target?: number;
  percentage?: number;
}

export const CaloriesExplainer: React.FC<CaloriesExplainerProps> = ({
  total = 1850,
  target = 2200,
  percentage = 84,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const semanticColor = colors.semantic.calories;

  const handleChangeTargets = () => {
    router.push("/onboarding/target-method");
  };

  return (
    <View style={styles.container}>
      <AppText role="Title1" style={styles.title}>
        Calories
      </AppText>
      <AppText role="Caption" style={styles.subTitle}>
        Today's energy budget
      </AppText>
      <View style={styles.content}>
        <View style={styles.ringSection}>
          <View style={styles.ringContainer}>
            <DashboardRing
              percentage={percentage}
              color={semanticColor}
              trackColor={colors.semanticSurfaces.calories}
              textColor={colors.primaryText}
              displayValue={total}
              displayUnit="kcal"
              detailValue={`of ${target}`}
              animationDelay={0}
              strokeWidth={22}
              Icon={Flame}
              skipAnimation
            />
          </View>
        </View>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor }]}
        >
          How it works
        </AppText>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            The ring fills as you log meals.
          </AppText>
        </View>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            The{" "}
            <Flame
              size={16}
              color={semanticColor}
              fill={semanticColor}
              strokeWidth={0}
              style={styles.inlineIcon}
            />{" "}
            icon shows your current position.
          </AppText>
        </View>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            Close the ring to hit today's budget.
          </AppText>
        </View>

        <AppText
          role="Headline"
          color="primary"
          style={[
            styles.sectionHeading,
            { color: semanticColor, marginTop: theme.spacing.md },
          ]}
        >
          Quick tips
        </AppText>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            Log every bite—consistency beats precision.
          </AppText>
        </View>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            Judge progress by your weekly average, not a single day.
          </AppText>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          label="Adjust targets"
          variant="secondary"
          onPress={handleChangeTargets}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    title: {
      textAlign: "center",
    },
    subTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    content: {
      flex: 1,
    },
    ringSection: {
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    ringContainer: {
      alignItems: "center",
    },
    sectionHeading: {
      marginBottom: theme.spacing.xs,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    bulletChar: {
      lineHeight: 22,
    },
    bulletText: {
      flex: 1,
      lineHeight: 22,
    },
    bold: {
      fontWeight: "600",
    },
    inlineIcon: {
      marginBottom: -2,
    },
    footnote: {
      marginTop: theme.spacing.xs,
    },
    buttonContainer: {
      alignItems: "center",
      paddingTop: theme.spacing.lg,
    },
  });
