import React, { useMemo, useState, useRef } from "react";
import { View } from "react-native";
import { Plus, MoreHorizontal } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components";
import { MenuPopover } from "@/components/shared/MenuPopover";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useAppStore } from "@/store/useAppStore";
import { createStyles } from "./Header.styles";
import { formatDate } from "@/utils/formatDate";
import { RoundButton } from "../../RoundButton";
import { hasDailyTargetsSet } from "@/utils";

export const Header: React.FC = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { safePush, safeNavigate } = useNavigationGuard();
  const selectedDate = useAppStore((state) => state.selectedDate);
  const dailyTargets = useAppStore((state) => state.dailyTargets);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const menuButtonRef = useRef<View>(null);

  const hasGoals = hasDailyTargetsSet(dailyTargets);

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  };

  const handleSettingsPress = () => {
    safePush("/settings");
  };

  const handleCalendarPress = () => {
    safePush("/calendar");
  };

  return (
    <>
      <View style={styles.header}>
        <AppText role="Title2" style={styles.headerTitle}>
          {formatDate(selectedDate)}
        </AppText>
        <View style={styles.headerButtonContainer}>
          <View ref={menuButtonRef} collapsable={false}>
            <RoundButton
              onPress={handleMenuPress}
              Icon={MoreHorizontal}
              variant="tertiary"
              accessibilityLabel="Open menu"
            />
          </View>
          <RoundButton
            Icon={Plus}
            variant="primary"
            onPress={() => safeNavigate("/create")}
            accessibilityLabel="Create new entry"
            disabled={!hasGoals}
          />
        </View>
      </View>
      <MenuPopover
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSettingsPress={handleSettingsPress}
        onCalendarPress={handleCalendarPress}
        triggerRef={menuButtonRef}
      />
    </>
  );
};
