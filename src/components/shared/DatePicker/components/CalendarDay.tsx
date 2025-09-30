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
  useSimplifiedRings,
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

  const simplifiedInnerScale = useMemo(() => {
    if (!useSimplifiedRings) {
      return 1;
    }

    const calorieRatio = Math.max(0, Math.min(1, (percentages.calories ?? 0) / 120));
    const averageRatio =
      (Math.max(0, percentages.calories ?? 0) +
        Math.max(0, percentages.protein ?? 0) +
        Math.max(0, percentages.carbs ?? 0)) /
      300;

    const base = Math.max(calorieRatio, averageRatio);
    return 0.45 + 0.55 * Math.max(0, Math.min(1, base));
  }, [percentages, useSimplifiedRings]);

  const simplifiedInnerStyle = useMemo(() => {
    if (!useSimplifiedRings) {
      return undefined;
    }

    const isTargetMet =
      (percentages.calories ?? 0) >= 95 && (percentages.calories ?? 0) <= 120;

    return [
      styles.simplifiedRingInner,
      {
        backgroundColor: isTargetMet
          ? colors.semantic.calories
          : colors.accent,
        opacity: (percentages.calories ?? 0) > 0 ? 0.85 : 0.2,
        transform: [{ scale: simplifiedInnerScale }],
      },
    ];
  }, [colors.accent, colors.semantic.calories, percentages, simplifiedInnerScale, styles.simplifiedRingInner, useSimplifiedRings]);

  const progressContent = useSimplifiedRings ? (
    <View style={styles.simplifiedRingWrapper}>
      <View style={simplifiedInnerStyle} />
    </View>
  ) : (
    <View style={styles.ringsContainer}>
      <ProgressRingsStatic
        percentages={percentages}
        size={36}
        strokeWidth={5}
        spacing={1}
        padding={1}
        nutrientKeys={["calories", "protein"]}
      />
    </View>
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={!isCurrentMonth || isFuture}
      activeOpacity={0.7}
    >
      {progressContent}
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
      prevProps.percentages.carbs === nextProps.percentages.carbs
    );
  }
);
