import React, { useMemo } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Card, AppText, Button } from "@/components";
import { RestorePurchasesButton } from "@/components/shared/RestorePurchasesButton";
import { useTheme } from "@/theme";
import { createStyles } from "./ProFeatureGate.styles";

interface ProFeatureGateProps {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
  showRestore?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ProFeatureGate: React.FC<ProFeatureGateProps> = ({
  title,
  description,
  buttonLabel,
  onPress,
  showRestore = false,
  style,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.content}>
        <AppText role="Caption" color="accent" style={styles.badge}>
          MacroLoop Pro
        </AppText>
        <AppText role="Headline" style={styles.title}>
          {title}
        </AppText>
        <AppText role="Body" color="secondary" style={styles.description}>
          {description}
        </AppText>
        <Button
          label={buttonLabel}
          variant="primary"
          onPress={onPress}
          style={styles.button}
        />
        {showRestore ? (
          <View style={styles.restore}>
            <RestorePurchasesButton />
          </View>
        ) : null}
      </View>
    </Card>
  );
};
