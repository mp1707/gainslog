import React, { useEffect } from "react";
import { ActionSheetIOS, Modal, Platform, Pressable, View } from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { createStyles } from "./ContextMenu.styles";
import { useTranslation } from "react-i18next";

export type ContextMenuItem = {
  label: string;
  destructive?: boolean;
  onPress?: () => void;
};

type ContextMenuProps = {
  visible: boolean;
  items: ContextMenuItem[];
  cancelText?: string;
  onClose: () => void;
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  items,
  cancelText,
  onClose,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const resolvedCancelText = cancelText ?? t("common.cancel");

  useEffect(() => {
    if (!visible) return;

    if (Platform.OS === "ios") {
      const options = [...items.map((i) => i.label), resolvedCancelText];
      const destructiveButtonIndex = items.findIndex((i) => i.destructive);
      const cancelButtonIndex = options.length - 1;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          ...(destructiveButtonIndex >= 0 ? { destructiveButtonIndex } : {}),
          userInterfaceStyle: colorScheme,
        },
        (buttonIndex) => {
          if (buttonIndex === cancelButtonIndex) {
            onClose();
            return;
          }
          const selected = items[buttonIndex];
          selected?.onPress?.();
          onClose();
        }
      );
    }
  }, [visible]);

  if (Platform.OS === "ios") {
    // iOS uses native ActionSheet; render nothing.
    return null;
  }

  // Basic, themed bottom-sheet fallback for non-iOS platforms
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={{ width: "100%" }}>
          <View style={styles.sheet}>
            {items.map((item, idx) => (
              <Pressable
                key={`${item.label}-${idx}`}
                style={styles.item}
                onPress={() => {
                  item.onPress?.();
                  onClose();
                }}
              >
                <AppText
                  style={[
                    theme.typography.Button,
                    styles.itemText,
                    item.destructive ? styles.destructiveText : null,
                  ]}
                >
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={styles.cancelBlock}>
            <Pressable style={styles.cancelItem} onPress={onClose}>
              <AppText style={[theme.typography.Button, styles.cancelText]}>
                {resolvedCancelText}
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
