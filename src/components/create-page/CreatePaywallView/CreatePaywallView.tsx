import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { BrainCircuit } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";
import type { Theme } from "@/theme";
import { InlinePaywallCard } from "@/components/paywall/InlinePaywallCard";

interface CreatePaywallViewProps {
  onShowPaywall: () => void;
}

export const CreatePaywallView = ({
  onShowPaywall,
}: CreatePaywallViewProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.paywallContainer}>
      <InlinePaywallCard
        Icon={BrainCircuit}
        title="AI Logging is a Pro Feature"
        body="Log meals effortlessly with a photo, text, or your voice."
        ctaLabel="Start Free Trial"
        onPress={onShowPaywall}
        testID="create-inline-paywall"
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    paywallContainer: {
      flex: 1,
      justifyContent: "center",
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
  });
