import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { BicepsFlexed } from "lucide-react-native";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button/Button";
import { Theme, useTheme } from "@/theme";
import { DashboardRing } from "@/components/shared/ProgressRings";
import { useSafeRouter } from "@/hooks/useSafeRouter";

interface ProteinExplainerProps {
  total?: number;
  target?: number;
  percentage?: number;
}

export const ProteinExplainer: React.FC<ProteinExplainerProps> = ({
  total = 145,
  target = 160,
  percentage = 91,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useSafeRouter();

  const semanticColor = colors.semantic.protein;

  const handleChangeTargets = () => {
    router.push("/onboarding/target-method");
  };

  return (
    <View style={styles.container}>
      <AppText role="Title1" style={styles.title}>
        Protein
      </AppText>
      <AppText role="Caption" style={styles.subTitle}>
        Build & Recover
      </AppText>
      <View style={styles.content}>
        <View style={styles.ringSection}>
          <View style={styles.ringContainer}>
            <DashboardRing
              percentage={percentage}
              color={semanticColor}
              trackColor={colors.semanticSurfaces.protein}
              textColor={colors.primaryText}
              displayValue={total}
              displayUnit="grams"
              detailValue={`of ${target}`}
              animationDelay={0}
              strokeWidth={22}
              Icon={BicepsFlexed}
              smallIcon
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
            The ring fills as you log protein.
          </AppText>
        </View>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            The{" "}
            <BicepsFlexed
              size={16}
              color={semanticColor}
              fill={semanticColor}
              strokeWidth={0}
              style={styles.inlineIcon}
            />{" "}
            icon marks your current position.
          </AppText>
        </View>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            Close the ring to reach today's minimum protein target.
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
            Include a protein source in every meal/snack.
          </AppText>
        </View>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            Spread intake across the day for better recovery.
          </AppText>
        </View>
        <View style={styles.bulletRow}>
          <AppText role="Body" color="secondary" style={styles.bulletChar}>
            •
          </AppText>
          <AppText role="Body" color="secondary" style={styles.bulletText}>
            A little over is okay—aim to meet or slightly exceed your target.
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
    buttonContainer: {
      alignItems: "center",
      paddingTop: theme.spacing.lg,
    },
  });
