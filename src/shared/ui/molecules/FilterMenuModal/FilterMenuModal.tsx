import React, { useMemo } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/providers";
import { BaseModal, ModalContent } from "@/shared/ui/organisms/BaseModal";

type NutrientFilterKey = "calories" | "protein" | "carbs" | "fat";

export interface FilterMenuModalProps {
  visible: boolean;
  onClose: () => void;
  filters: Record<NutrientFilterKey, boolean>;
  onToggle: (key: NutrientFilterKey) => void;
}

export const FilterMenuModal: React.FC<FilterMenuModalProps> = ({
  visible,
  onClose,
  filters,
  onToggle,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const renderRow = (key: NutrientFilterKey, label: string) => {
    const value = !!filters[key];
    const trueColor =
      key === "calories"
        ? colors.semantic?.calories || colors.accent
        : key === "protein"
        ? colors.semantic?.protein || colors.accent
        : key === "carbs"
        ? colors.semantic?.carbs || colors.accent
        : colors.semantic?.fat || colors.accent;
    return (
      <View key={key} style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Switch
          value={value}
          onValueChange={() => onToggle(key)}
          trackColor={{ false: colors.disabledBackground, true: trueColor }}
          thumbColor={colors.white}
          accessibilityRole="switch"
          accessibilityLabel={`Toggle ${label}`}
        />
      </View>
    );
  };


  return (
    <BaseModal visible={visible} onClose={onClose}>
      <ModalContent title="Details shown" onClose={onClose}>
        {renderRow("calories", "Calories")}
        {renderRow("protein", "Protein")}
        {renderRow("carbs", "Carbs")}
        {renderRow("fat", "Fat")}
      </ModalContent>
    </BaseModal>
  );
};

function createStyles(colors: any, themeObj: any) {
  const { spacing, typography } = themeObj;
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
    },
    rowLabel: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.primaryText,
    },
  });
}
