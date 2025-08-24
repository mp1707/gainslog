import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import {
  PencilIcon,
  CameraIcon,
  ImageIcon,
  MicrophoneIcon,
  StarIcon,
} from "phosphor-react-native";
import { BaseModal } from "@/components/shared/BaseModal";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { createStyles } from "./NewLogSheet.styles";

interface NewLogSheetProps {
  visible: boolean;
  onClose: () => void;
  onManualLog: () => void;
  onCameraLog: () => void;
  onLibraryLog: () => void;
  onAudioLog: () => void;
  onFavoritesLog?: () => void;
}

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
}

export const NewLogSheet: React.FC<NewLogSheetProps> = ({
  visible,
  onClose,
  onManualLog,
  onCameraLog,
  onLibraryLog,
  onAudioLog,
  onFavoritesLog,
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
      icon: <PencilIcon size={iconSize} color={iconColor} weight="regular" />,
      label: "Manual Entry",
      subtitle: "Type food description manually",
      onPress: onManualLog,
      accessibilityLabel: "Manual food entry",
      accessibilityHint: "Opens manual food logging form",
    },
    {
      icon: <CameraIcon size={iconSize} color={iconColor} weight="regular" />,
      label: "Take Photo",
      subtitle: "Capture food with camera",
      onPress: onCameraLog,
      accessibilityLabel: "Take photo",
      accessibilityHint: "Opens camera to photograph food",
    },
    {
      icon: <ImageIcon size={iconSize} color={iconColor} weight="regular" />,
      label: "Photo Library",
      subtitle: "Choose existing photo",
      onPress: onLibraryLog,
      accessibilityLabel: "Choose from library",
      accessibilityHint: "Opens photo library to select food image",
    },
    {
      icon: (
        <MicrophoneIcon size={iconSize} color={iconColor} weight="regular" />
      ),
      label: "Voice Recording",
      subtitle: "Describe food with voice",
      onPress: onAudioLog,
      accessibilityLabel: "Record audio",
      accessibilityHint: "Opens audio recording for voice food logging",
    },
    {
      icon: <StarIcon size={iconSize} color={iconColor} weight="regular" />,
      label: "Favorites",
      subtitle: "Reuse previous entry",
      onPress: onFavoritesLog || (() => {}),
      accessibilityLabel: "Choose favorite",
      accessibilityHint: "Open favorites to reuse a previous entry",
    },
  ];

  const handleActionPress = (action: () => void) => {
    // Prevent multiple rapid taps
    if (isNavigating) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Store the action to execute after navigation and animation complete
    pendingActionRef.current = () => {
      // Navigate to index tab first, then execute action after delay
      safeNavigate("/");
      setTimeout(() => {
        action();
      }, 250); // Allow time for navigation to complete
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

        <Text style={styles.title}>New Food Log</Text>

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
              <View style={styles.actionIcon}>{action.icon}</View>
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
