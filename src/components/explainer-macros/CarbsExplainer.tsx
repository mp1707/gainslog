import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Zap } from "lucide-react-native";
import { useRouter } from "expo-router";

import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button/Button";
import { Theme, useTheme } from "@/theme";

interface CarbsExplainerProps {
  total?: number;
}

export const CarbsExplainer: React.FC<CarbsExplainerProps> = ({ total = 218 }) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const semanticColor = colors.semantic.carbs;

  const handleChangeTargets = () => {
    router.push("/onboarding/target-method");
  };

  return (
    <View style={styles.container}>
      <AppText role="Title1" style={styles.title}>
        Carbs: Flexible Fuel
      </AppText>

      <View style={styles.content}>
        {/* MacroGridCell-style display */}
        <View style={styles.displaySection}>
          <AppText role="Subhead" color="secondary" style={styles.label}>
            Carbs
          </AppText>
          <View style={styles.valueRow}>
            <View style={styles.iconWrapper}>
              <Zap
                size={22}
                color={semanticColor}
                fill={semanticColor}
                strokeWidth={0}
              />
            </View>
            <View style={styles.valueContainer}>
              <AppText role="Headline" color="primary">
                {total}
              </AppText>
              <AppText role="Body" color="secondary" style={styles.unitText}>
                {" "}
                g
              </AppText>
            </View>
          </View>
        </View>

        <AppText role="Headline" color="primary" style={[styles.sectionHeading, { color: semanticColor }]}>
          A Flexible Total
        </AppText>
        <AppText role="Body" color="secondary" style={styles.contentText}>
          No fixed target—carbs fill remaining calories after protein and fat.
        </AppText>

        <AppText
          role="Headline"
          color="primary"
          style={[styles.sectionHeading, { color: semanticColor, marginTop: theme.spacing.md }]}
        >
          Your Fuel Source
        </AppText>
        <AppText role="Body" color="secondary" style={styles.contentText}>
          Preferred fuel for training and activity. Adjust based on energy needs and activity level.
        </AppText>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          label="Change targets"
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
      marginBottom: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    displaySection: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    label: {
      textAlign: "center",
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    iconWrapper: {
      justifyContent: "center",
      alignItems: "center",
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    unitText: {
      marginLeft: theme.spacing.xs / 2,
    },
    sectionHeading: {
      marginBottom: theme.spacing.xs,
    },
    contentText: {
      lineHeight: 20,
    },
    buttonContainer: {
      alignItems: "center",
      paddingTop: theme.spacing.lg,
    },
  });
