import React from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import { AppText, Card } from "@/components";
import { useTheme } from "@/theme";
import { createStyles } from "./ComponentsList.styles";
import type { FoodComponent } from "@/types/models";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions/SwipeToFunctions";

const HIGHLIGHT_BORDER_RADIUS = 14;
interface ComponentsListProps {
  components: FoodComponent[];
  onPressItem: (index: number, comp: FoodComponent) => void;
  onDeleteItem: (index: number) => void;
  onAddPress: () => void;
  disabled?: boolean;
}

export const ComponentsList: React.FC<ComponentsListProps> = ({
  components,
  onPressItem,
  onDeleteItem,
  onAddPress,
  disabled,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <Card style={styles.container}>
      <View style={styles.cardHeaderRow}>
        <AppText role="Caption" style={styles.sectionHeader}>
          COMPONENTS
        </AppText>
      </View>
      {components.map((comp, index) => (
        <Animated.View key={`${comp.name}-${index}`}>
          <SwipeToFunctions
            onDelete={() => onDeleteItem(index)}
            onTap={() => onPressItem(index, comp)}
            borderRadius={HIGHLIGHT_BORDER_RADIUS}
          >
            <View
              style={[
                styles.solidBackgroundForSwipe,
                { borderRadius: HIGHLIGHT_BORDER_RADIUS },
              ]}
            >
              <View
                style={[
                  styles.componentRow,
                  { borderRadius: HIGHLIGHT_BORDER_RADIUS },
                ]}
              >
                <View style={styles.leftColumn}>
                  <AppText style={styles.componentName}>{comp.name}</AppText>
                </View>
                <View style={styles.rightColumn}>
                  <AppText color="secondary" style={styles.amountText}>
                    {comp.amount} {comp.unit ?? ""}
                  </AppText>
                </View>
              </View>
            </View>
          </SwipeToFunctions>
        </Animated.View>
      ))}
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
