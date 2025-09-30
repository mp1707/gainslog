import React from "react";
import { View, Pressable, Text } from "react-native";

import { ProgressRingsStatic } from "@/components/shared/ProgressRings";
import { useTheme } from "@/theme";
import { getTodayKey } from "@/utils/dateHelpers";

export interface DayData {
  date: string; // YYYY-MM-DD
  weekday: string; // Single letter: M, T, W, etc.
  percentages: {
    calories: number;
    protein: number;
    carbs: number;
  };
}

interface DayItemProps {
  item: DayData;
  isSelected: boolean;
  onPress: (date: string) => void;
  styles: any;
}

export const DayItem: React.FC<DayItemProps> = React.memo(
  ({ item, isSelected, onPress, styles }) => {
    const { colors } = useTheme();
    const today = getTodayKey();
    const isToday = item.date === today;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.itemContainer,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
        ]}
        onPress={() => onPress(item.date)}
        accessibilityLabel={`Select ${item.date}`}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.weekdayContainer,
            isSelected && styles.selectedWeekdayContainer,
          ]}
        >
          <Text
            style={[
              styles.weekdayText,
              isSelected && styles.selectedWeekdayText,
              isToday && { color: colors.accent, fontWeight: "800" },
            ]}
          >
            {item.weekday}
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <ProgressRingsStatic
            percentages={item.percentages}
            size={45}
            strokeWidth={6}
            spacing={1}
            padding={1}
            nutrientKeys={["calories", "protein"]}
          />
        </View>
      </Pressable>
    );
  }
);
