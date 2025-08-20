import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import {
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "phosphor-react-native";
import { BaseModal } from "@/shared/ui/organisms/BaseModal";
import { useTheme } from "@/providers/ThemeProvider";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import { FoodLog } from "@/types";
import { createStyles } from "./FoodLogOptionsSheet.styles";

interface FoodLogOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  foodLog: FoodLog;
  isFavorite: boolean;
  onEdit: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
}

export const FoodLogOptionsSheet: React.FC<FoodLogOptionsSheetProps> = ({
  visible,
  onClose,
  foodLog,
  isFavorite,
  onEdit,
  onToggleFavorite,
  onDelete,
}) => {
  const { colors } = useTheme();
  const { safeNavigate, isNavigating } = useNavigationGuard();
  const styles = createStyles(colors);
  
  // State to trigger smooth close animation
  const [shouldAnimateOut, setShouldAnimateOut] = useState(false);
  // Ref to store the pending action to execute after animation
  const pendingActionRef = useRef<(() => void) | null>(null);

  const iconColor = colors.white;
  const iconSize = 24;

  // Handle animation completion - execute pending action with delay
  const handleAnimationComplete = () => {
    if (pendingActionRef.current) {
      // Execute the action after a brief delay for smooth transition
      setTimeout(() => {
        pendingActionRef.current?.();
        pendingActionRef.current = null;
        setShouldAnimateOut(false);
      }, 120); // Maintain existing 120ms delay between modals
    }
  };

  const actions: ActionItem[] = [
    {
      icon: (
        <PencilIcon
          size={iconSize}
          color={iconColor}
          weight="regular"
        />
      ),
      label: "Edit Entry",
      subtitle: "Modify nutrition details",
      onPress: onEdit,
      accessibilityLabel: "Edit food entry",
      accessibilityHint: "Opens editor to modify this food log entry",
    },
    {
      icon: (
        <StarIcon
          size={iconSize}
          color={iconColor}
          weight={isFavorite ? "fill" : "regular"}
        />
      ),
      label: isFavorite ? "Remove Favorite" : "Add to Favorites",
      subtitle: isFavorite ? "Remove from saved entries" : "Save for quick access",
      onPress: onToggleFavorite,
      accessibilityLabel: isFavorite ? "Remove favorite" : "Add to favorites",
      accessibilityHint: isFavorite 
        ? "Removes this entry from your favorites"
        : "Adds this entry to your favorites",
    },
    {
      icon: (
        <TrashIcon
          size={iconSize}
          color={iconColor}
          weight="regular"
        />
      ),
      label: "Delete Entry",
      subtitle: "Remove from food log",
      onPress: onDelete,
      accessibilityLabel: "Delete food entry",
      accessibilityHint: "Permanently removes this entry from your food log",
    },
  ];

  const handleActionPress = (action: () => void) => {
    // Prevent multiple rapid taps
    if (isNavigating) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Store the action to execute after animation complete
    pendingActionRef.current = () => {
      action();
    };
    
    // Trigger smooth close animation
    setShouldAnimateOut(true);
  };

  return (
    <BaseModal 
      visible={visible} 
      onClose={onClose}
      onAnimationComplete={handleAnimationComplete}
      animateOut={shouldAnimateOut}
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        
        <Text style={styles.title}>Food Log Options</Text>
        
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={() => handleActionPress(action.onPress)}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              accessibilityHint={action.accessibilityHint}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                {action.icon}
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionLabel}>{action.label}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BaseModal>
  );
};