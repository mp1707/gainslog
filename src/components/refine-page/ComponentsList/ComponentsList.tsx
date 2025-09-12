import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, { Easing, Layout } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2, ChevronRight, Plus } from 'lucide-react-native';
import { AppText } from '@/components';
import { useTheme } from '@/theme';
import { createStyles } from './ComponentsList.styles';
import type { FoodComponent } from '@/types/models';

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
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <AppText role="Caption" style={styles.sectionHeader}>
          COMPONENTS
        </AppText>
      </View>
      {components.map((comp, index) => (
        <Animated.View
          key={`${comp.name}-${index}`}
          layout={Layout.duration(220).easing(Easing.inOut(Easing.ease))}
          style={styles.overflowHidden}
        >
          <Swipeable
            renderRightActions={() => (
              <TouchableOpacity
                onPress={() => onDeleteItem(index)}
                style={styles.deleteAction}
                accessibilityLabel="Delete ingredient"
              >
                <Trash2 size={18} color={colors.white} />
                <AppText role="Button" color="white">
                  Delete
                </AppText>
              </TouchableOpacity>
            )}
          >
            <TouchableOpacity
              style={styles.componentRow}
              onPress={() => onPressItem(index, comp)}
            >
              <AppText style={styles.componentName}>{comp.name}</AppText>
              <AppText color="secondary" style={styles.amountText}>
                {comp.amount}
              </AppText>
              <ChevronRight size={18} color={colors.secondaryText} />
            </TouchableOpacity>
          </Swipeable>
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
    </View>
  );
};

