import React, { useCallback, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./ComponentsList.styles";
import type { FoodComponent } from "@/types/models";
import { ComponentRow } from "./ComponentRow";

interface ComponentsListProps {
  components: FoodComponent[];
  onPressItem: (index: number, comp: FoodComponent) => void;
  onDeleteItem: (index: number) => void;
  onAddPress: () => void;
  onAcceptRecommendation: (index: number, comp: FoodComponent) => void;
  disabled?: boolean;
}

export const ComponentsList: React.FC<ComponentsListProps> = ({
  components,
  onPressItem,
  onDeleteItem,
  onAddPress,
  onAcceptRecommendation,
  disabled,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Simplified: handleRowTap now only opens the edit modal
  const handleRowTap = useCallback(
    (index: number, comp: FoodComponent) => {
      onPressItem(index, comp);
    },
    [onPressItem]
  );

  // New: separate handler for toggling expansion
  const handleToggleExpansion = useCallback(
    (index: number) => {
      setExpandedIndex((prev) => (prev === index ? null : index));
    },
    []
  );

  const handleAcceptRecommendation = useCallback(
    (index: number, comp: FoodComponent) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Delay collapse and data update to allow smooth collapse animation
      setTimeout(() => {
        setExpandedIndex(null);
        onAcceptRecommendation(index, comp);
      }, 300); // Allow smooth collapse animation
    },
    [onAcceptRecommendation]
  );

  const handleEditManually = useCallback(
    (index: number, comp: FoodComponent) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setExpandedIndex(null);
      onPressItem(index, comp);
    },
    [onPressItem]
  );

  return (
    <View style={styles.container}>
      <AppText role="Caption" style={styles.sectionHeader}>
        COMPONENTS
      </AppText>

      <View style={styles.listContainer}>
        {components.map((comp, index) => (
          <React.Fragment key={`${comp.name}-${index}`}>
            <ComponentRow
              component={comp}
              index={index}
              isExpanded={expandedIndex === index}
              onTap={handleRowTap}
              onToggleExpansion={handleToggleExpansion}
              onDelete={onDeleteItem}
              onAcceptRecommendation={handleAcceptRecommendation}
              onEditManually={handleEditManually}
            />
            {index < components.length - 1 && (
              <View style={styles.separator} />
            )}
          </React.Fragment>
        ))}

        {/* No separator before Add Ingredient - it's an action row */}
        <TouchableOpacity
          onPress={onAddPress}
          style={styles.addRow}
          disabled={disabled}
          accessibilityLabel="Add Ingredient"
          accessibilityRole="button"
        >
          <Plus size={18} color={colors.accent} />
          <AppText style={styles.addLabel} color="accent">
            Add Ingredient
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
