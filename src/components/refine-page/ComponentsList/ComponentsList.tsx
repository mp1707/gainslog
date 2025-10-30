import React, { useCallback, useMemo, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./ComponentsList.styles";
import type { FoodComponent } from "@/types/models";
import { ComponentRow } from "./ComponentRow";
import Animated, { Easing, Layout } from "react-native-reanimated";

const easeLayout = Layout.duration(220).easing(Easing.inOut(Easing.quad));

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
  const handleToggleExpansion = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleAcceptRecommendation = useCallback(
    (index: number, comp: FoodComponent) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // First collapse the expansion to trigger animation
      setExpandedIndex(null);

      // Then update data after animation completes
      setTimeout(() => {
        onAcceptRecommendation(index, comp);
      }, 300); // Allow smooth collapse animation (250ms + buffer)
    },
    [onAcceptRecommendation]
  );

  return (
    <Animated.View layout={easeLayout} style={styles.container}>
      <AppText role="Caption" style={styles.sectionHeader}>
         INGREDIENTS
      </AppText>

      <Animated.View layout={easeLayout} style={styles.listContainer}>
        {components.map((comp, index) => (
          <Animated.View
            key={`${comp.name}-${index}`}
            layout={easeLayout}
          >
            <ComponentRow
              component={comp}
              index={index}
              isExpanded={expandedIndex === index}
              onTap={handleRowTap}
              onToggleExpansion={handleToggleExpansion}
              onDelete={onDeleteItem}
              onAcceptRecommendation={handleAcceptRecommendation}
            />
            {index < components.length - 1 && (
              <Animated.View layout={easeLayout} style={styles.separator} />
            )}
          </Animated.View>
        ))}
        <Animated.View layout={easeLayout} style={styles.separator} />
        <Animated.View layout={easeLayout}>
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
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};
