import React from "react";
import { View } from "react-native";
import { LegacyFoodLog } from "@/types/indexLegacy";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/providers";
import { createStyles } from "./MacroRow.styles";

interface MacroRowProps {
  foodLog: LegacyFoodLog;
}

interface MacroItemProps {
  label: string;
  value: string;
  color: string;
  accessibilityLabel: string;
}

const MacroItem: React.FC<MacroItemProps> = ({
  label,
  value,
  color,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={styles.macroItem}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      <AppText role="Caption" color="secondary" style={styles.label}>
        {label}
      </AppText>
      <AppText role="Subhead" style={[styles.value, { color }]}>
        {value}
      </AppText>
    </View>
  );
};

export const MacroRow: React.FC<MacroRowProps> = ({ foodLog }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const macroData = [
    {
      label: "Protein",
      value: `${foodLog.protein}g`,
      color: colors.semantic?.protein || colors.primaryText,
      accessibilityLabel: `${foodLog.protein} grams of protein`,
    },
    {
      label: "Carbs",
      value: `${foodLog.carbs}g`,
      color: colors.semantic?.carbs || colors.primaryText,
      accessibilityLabel: `${foodLog.carbs} grams of carbohydrates`,
    },
    {
      label: "Fat",
      value: `${foodLog.fat}g`,
      color: colors.semantic?.fat || colors.primaryText,
      accessibilityLabel: `${foodLog.fat} grams of fat`,
    },
    {
      label: "Calories",
      value: `${foodLog.calories}`,
      color: colors.semantic?.calories || colors.primaryText,
      accessibilityLabel: `${foodLog.calories} calories`,
    },
  ];

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Nutrition information: ${foodLog.protein}g protein, ${foodLog.carbs}g carbohydrates, ${foodLog.fat}g fat, ${foodLog.calories} calories`}
    >
      <View style={styles.gridContainer}>
        {macroData.map((macro, index) => (
          <MacroItem
            key={index}
            label={macro.label}
            value={macro.value}
            color={macro.color}
            accessibilityLabel={macro.accessibilityLabel}
          />
        ))}
      </View>
    </View>
  );
};
