import { useTheme } from "@/theme/ThemeProvider";
import React, { useCallback, useMemo } from "react";
import { Dimensions, View } from "react-native";
import { createStyles } from "./DateSlider.styles";
import { Header } from "./components/Header";
import * as Haptics from "expo-haptics";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 20;
const ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING) / 7;

const DashboardHeader = () => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, theme, ITEM_WIDTH),
    [colors, theme]
  );

  const handleCalendarPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <View style={styles.container}>
      <Header onCalendarPress={handleCalendarPress} />
    </View>
  );
};

export default DashboardHeader;
