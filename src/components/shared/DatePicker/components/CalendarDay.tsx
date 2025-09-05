import React, { useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { AppText } from "@/components";
import { ProgressRings } from "@/components/shared/ProgressRings";
import { useTheme } from "@/theme";
import { createStyles } from "./CalendarDay.styles";
import { isToday } from "@/utils/dateHelpers";

interface CalendarDayProps {
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  percentages: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  onPress: (dateKey: string) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  dateKey,
  day,
  isCurrentMonth,
  isSelected,
  percentages,
  onPress,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  
  const isDayToday = useMemo(() => isToday(dateKey), [dateKey]);
  
  const handlePress = () => {
    if (isCurrentMonth) {
      onPress(dateKey);
    }
  };

  // Get container style based on state
  const containerStyle = useMemo(() => {
    if (!isCurrentMonth) {
      return [styles.container, styles.containerDisabled];
    } else if (isSelected) {
      return [styles.container, styles.containerSelected];
    } else if (isDayToday) {
      return [styles.container, styles.containerToday];
    }
    
    return styles.container;
  }, [
    styles,
    isCurrentMonth,
    isSelected,
    isDayToday,
  ]);

  // Get text style based on state
  const textStyle = useMemo(() => {
    if (!isCurrentMonth) {
      return [styles.dayText, styles.dayTextDisabled];
    } else if (isSelected) {
      return [styles.dayText, styles.dayTextSelected];
    } else if (isDayToday) {
      return [styles.dayText, styles.dayTextToday];
    }
    
    return styles.dayText;
  }, [
    styles,
    isCurrentMonth,
    isSelected,
    isDayToday,
  ]);

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={!isCurrentMonth}
      activeOpacity={0.7}
    >
      <View style={styles.ringsContainer}>
        <ProgressRings
          percentages={percentages}
          size={32}
          strokeWidth={3}
          spacing={1}
          padding={1}
        />
      </View>
      <AppText role="Caption" style={textStyle}>
        {day}
      </AppText>
    </TouchableOpacity>
  );
};