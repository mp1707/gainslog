import React, { useMemo, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Button, ContextMenu, Host, Image } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";

import { AppText } from "@/components/shared/AppText";
import { DynamicRoundButton } from "@/components/shared/DynamicRoundButton";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useAppStore } from "@/store/useAppStore";
import { useTheme } from "@/theme";
import { Theme } from "@/theme/theme";
import { formatDate } from "@/utils/formatDate";
import { buttonStyle, clipShape, padding } from "@expo/ui/swift-ui/modifiers";
import { Plus } from "lucide-react-native";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export const Header: React.FC = () => {
  const { safeNavigate, safePush } = useNavigationGuard();
  const { colors, theme, colorScheme } = useTheme();
  const { selectedDate } = useAppStore();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleCreatePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeNavigate("/create");
  }, [safeNavigate]);

  const handleSettingsPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/settings");
  }, [safePush]);

  const handleCalendarPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safePush("/calendar");
  }, [safePush]);

  return (
    <View style={styles.container}>
      <AppText role="Title2" style={styles.dateLabel}>
        {formatDate(selectedDate)}
      </AppText>

      <View style={styles.actions}>
        <Host matchContents style={styles.nativeHost}>
          <ContextMenu
            activationMethod="singlePress"
            modifiers={[
              isLiquidGlassAvailable()
                ? buttonStyle("glass")
                : buttonStyle("bordered"),
              clipShape("circle"),
            ]}
          >
            <ContextMenu.Trigger>
              <Image
                modifiers={[
                  padding({
                    vertical: !isLiquidGlassAvailable()
                      ? theme.spacing.xs * 2.8
                      : theme.spacing.xs * 3.5,
                  }),
                ]}
                systemName={"ellipsis"}
                color={colors.primaryText}
              />
            </ContextMenu.Trigger>
            <ContextMenu.Items>
              <Button systemImage="calendar" onPress={handleCalendarPress}>
                Calendar
              </Button>
              <Button systemImage="gearshape" onPress={handleSettingsPress}>
                Settings
              </Button>
            </ContextMenu.Items>
          </ContextMenu>
        </Host>
        <DynamicRoundButton
          variant="primary"
          controlSize="regular"
          systemIcon="plus"
          legacyIcon={Plus}
          onPress={handleCreatePress}
          hostStyle={styles.nativeHost}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.layout.header.padding,
      paddingBottom: theme.layout.header.spacing,
    },
    dateLabel: {
      flexShrink: 1,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: theme.spacing.sm,
    },
    nativeHost: {
      flexShrink: 0,
    },
  });
