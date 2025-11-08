import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Info } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/ThemeProvider";
import type { Colors, Theme } from "@/theme";
import { AppText } from "@/components/shared/AppText";
import { HeaderButton } from "@/components/shared/HeaderButton";

interface CreateHeaderProps {
  onCancel: () => void;
  onOpenExplainer: () => void;
}

export const CreateHeader = ({
  onCancel,
  onOpenExplainer,
}: CreateHeaderProps) => {
  const { theme, colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: insets.top + theme.spacing.sm },
      ]}
    >
      <Pressable
        onPress={onOpenExplainer}
        style={({ pressed }) => [
          styles.headerInfoButton,
          pressed && styles.headerInfoButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t("createLog.header.explainer")}
      >
        <AppText
          role="Title1"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.headerTitle}
        >
          {t("createLog.header.title")}
        </AppText>
        <Info size={20} color={colors.accent} />
      </Pressable>
      <HeaderButton
        buttonProps={{
          onPress: onCancel,
          color: colors.secondaryBackground,
        }}
        imageProps={{
          systemName: "xmark",
          color: colors.primaryText,
        }}
      />
    </View>
  );
};

const createStyles = (theme: Theme, colors: Colors) =>
  StyleSheet.create({
    headerContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerInfoButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
      flexShrink: 1,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.xs,
    },
    headerInfoButtonPressed: {
      opacity: 0.6,
    },
    headerTitle: {
      color: colors.primaryText,
      flexShrink: 1,
    },
  });
