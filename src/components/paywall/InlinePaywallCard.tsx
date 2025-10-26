import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LucideIcon } from "lucide-react-native";

import { Card } from "@/components/Card";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { useTheme } from "@/theme";

interface InlinePaywallCardProps {
  Icon: LucideIcon;
  title: string;
  body: string;
  ctaLabel: string;
  onPress: () => void;
  testID?: string;
}

export const InlinePaywallCard: React.FC<InlinePaywallCardProps> = ({
  Icon,
  title,
  body,
  ctaLabel,
  onPress,
  testID,
}) => {
  const { colors, theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: theme.spacing.md,
        },
        header: {
          flexDirection: "row",
          gap: theme.spacing.md,
          alignItems: "center",
        },
        iconWrapper: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(68, 235, 212, 0.2)",
          alignItems: "center",
          justifyContent: "center",
        },
        textStack: {
          flex: 1,
          gap: theme.spacing.xs,
        },
        button: {
          alignSelf: "stretch",
        },
      }),
    [colors, theme]
  );

  return (
    <Card style={styles.container} testID={testID}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Icon size={22} color={colors.accent} />
        </View>
        <View style={styles.textStack}>
          <AppText role="Headline">{title}</AppText>
          <AppText role="Body" color="secondary">
            {body}
          </AppText>
        </View>
      </View>
      <Button
        variant="primary"
        label={ctaLabel}
        onPress={onPress}
        style={styles.button}
      />
    </Card>
  );
};
