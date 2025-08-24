import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/theme";

export interface ModalContentProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  actionButtons?: ReactNode;
  showDivider?: boolean;
  testID?: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  title,
  onClose,
  children,
  actionButtons,
  showDivider = true,
  testID,
}) => {
  const { colors, theme } = useTheme();
  const { spacing, typography } = theme;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.primaryBackground,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: showDivider ? spacing.md : spacing.lg,
    },
    title: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },
    closeButton: {
      padding: spacing.xs,
    },
    closeText: {
      fontSize: typography.Button.fontSize,
      fontFamily: typography.Button.fontFamily,
      fontWeight: typography.Button.fontWeight,
      color: colors.accent,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.disabledBackground,
      marginBottom: spacing.lg,
    },
    contentArea: {
      // No additional styling - let children define their own layout
    },
    actionButtonsContainer: {
      marginTop: spacing.lg,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {/* Header with title and close button */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        >
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>

      {/* Optional divider */}
      {showDivider && <View style={styles.divider} />}

      {/* Content area */}
      <View style={styles.contentArea}>
        {children}
      </View>

      {/* Optional action buttons */}
      {actionButtons && (
        <View style={styles.actionButtonsContainer}>
          {actionButtons}
        </View>
      )}
    </View>
  );
};