import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { AppText, Card } from "@/components";
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
  const styles = createStyles(colors, theme);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleRowTap = (index: number, comp: FoodComponent) => {
    if (comp.recommendedMeasurement) {
      // Has recommendation → toggle inline expansion
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setExpandedIndex(expandedIndex === index ? null : index);
    } else {
      // No recommendation → show edit sheet
      onPressItem(index, comp);
    }
  };

  const handleAcceptRecommendation = (index: number, comp: FoodComponent) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setExpandedIndex(null);
    onAcceptRecommendation(index, comp);
  };

  const handleEditManually = (index: number, comp: FoodComponent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIndex(null);
    onPressItem(index, comp);
  };

  return (
    <Card style={styles.container}>
      <View style={styles.cardHeaderRow}>
        <AppText role="Caption" style={styles.sectionHeader}>
          COMPONENTS
        </AppText>
      </View>
      <View style={styles.componentRowContainer}>
        {components.map((comp, index) => (
          <ComponentRow
            key={`${comp.name}-${index}`}
            component={comp}
            index={index}
            isExpanded={expandedIndex === index}
            onTap={() => handleRowTap(index, comp)}
            onDelete={() => onDeleteItem(index)}
            onAcceptRecommendation={() =>
              handleAcceptRecommendation(index, comp)
            }
            onEditManually={() => handleEditManually(index, comp)}
          />
        ))}
      </View>
      <TouchableOpacity
        onPress={onAddPress}
        style={styles.addRow}
        disabled={disabled}
        accessibilityLabel="Add Ingredient"
      >
        <Plus size={18} color={colors.accent} />
        <AppText style={styles.addLabel} color="accent">
          Add Ingredient
        </AppText>
      </TouchableOpacity>
    </Card>
  );
};
