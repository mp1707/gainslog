import React, { useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { AppText } from "@/components";
import { ProgressRingsStatic } from "@/components/shared/ProgressRings";
import { useTheme } from "@/theme";
import { createStyles } from "./CalendarDay.styles";
import { isToday } from "@/utils/dateHelpers";

interface CalendarDayProps {
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isFuture: boolean;
  percentages: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  onPress: (dateKey: string) => void;
  useSimplifiedRings?: boolean;
}

const CalendarDayComponent: React.FC<CalendarDayProps> = ({
  dateKey,
  day,
  isCurrentMonth,
  isSelected,
  isFuture,
  percentages,
  onPress,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const handlePress = () => {
    if (isCurrentMonth && !isFuture) {
      onPress(dateKey);
    }
  };

  // Optimize all styling and state calculations in one useMemo
  const { containerStyle, textStyle } = useMemo(() => {
    const todayCheck = isToday(dateKey);

    let containerStyles, textStyles;

    if (!isCurrentMonth || isFuture) {
      containerStyles = [styles.container, styles.containerDisabled];
      textStyles = [styles.dayText, styles.dayTextDisabled];
    } else if (isSelected) {
      containerStyles = [styles.container, styles.containerSelected];
      textStyles = [styles.dayText, styles.dayTextSelected];
    } else if (todayCheck) {
      containerStyles = [styles.container, styles.containerToday];
      textStyles = [styles.dayText, styles.dayTextToday];
    } else {
      containerStyles = styles.container;
      textStyles = styles.dayText;
    }

    return {
      containerStyle: containerStyles,
      textStyle: textStyles,
    };
  }, [styles, isCurrentMonth, isSelected, isFuture, dateKey]);

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={!isCurrentMonth || isFuture}
      activeOpacity={0.7}
    >
      <View style={styles.ringsContainer}>
        <ProgressRingsStatic
          percentages={percentages}
          size={36}
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

// Memoized component for optimal performance
export const CalendarDay = React.memo(
  CalendarDayComponent,
  (prevProps, nextProps) => {
    // Only re-render if props actually change
    return (
      prevProps.dateKey === nextProps.dateKey &&
      prevProps.day === nextProps.day &&
      prevProps.isCurrentMonth === nextProps.isCurrentMonth &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isFuture === nextProps.isFuture &&
      prevProps.useSimplifiedRings === nextProps.useSimplifiedRings &&
      prevProps.onPress === nextProps.onPress &&
      // Deep comparison for percentages object
      prevProps.percentages.calories === nextProps.percentages.calories &&
      prevProps.percentages.protein === nextProps.percentages.protein &&
      prevProps.percentages.carbs === nextProps.percentages.carbs &&
      prevProps.percentages.fat === nextProps.percentages.fat
    );
  }
);
