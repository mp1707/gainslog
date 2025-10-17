import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View } from "react-native";
import { TextInput } from "@/components/shared/TextInput";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components/shared/AppText";
import { IOSButton } from "@/components/shared/IOSButton";
import { useTheme } from "@/theme";
import { createStyles } from "./ComponentEditor.styles";
import type { FoodComponent } from "@/types/models";
import {
  Button,
  Host,
  Text,
  VStack,
  Picker,
  ContextMenu,
  Image,
  HStack,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  fixedSize,
  frame,
  padding,
} from "@expo/ui/swift-ui/modifiers";

interface ComponentEditorProps {
  component: FoodComponent | null;
  isAdding: boolean;
  onSave: (component: FoodComponent) => void;
  onCancel: () => void;
}

const UNIT_OPTIONS: FoodComponent["unit"][] = ["g", "ml", "piece"];

export const ComponentEditor: React.FC<ComponentEditorProps> = ({
  component,
  isAdding,
  onSave,
  onCancel,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  // Form state
  const [name, setName] = useState(component?.name || "");
  const [amount, setAmount] = useState(
    component?.amount ? String(component.amount) : ""
  );
  const [unit, setUnit] = useState<FoodComponent["unit"]>(
    component?.unit || "g"
  );

  // Update form when component prop changes
  useEffect(() => {
    if (component) {
      setName(component.name);
      setAmount(component.amount ? String(component.amount) : "");
      setUnit(component.unit);
    } else {
      setName("");
      setAmount("");
      setUnit("g");
    }
  }, [component]);

  const handleUnitSelect = useCallback((index: number) => {
    setUnit(UNIT_OPTIONS[index]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleSave = useCallback(() => {
    const amountValue = Number(amount);
    if (name.trim() && amountValue > 0) {
      onSave({
        name: name.trim(),
        amount: amountValue,
        unit,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [name, amount, unit, onSave]);

  const handleCancel = useCallback(() => {
    onCancel();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [onCancel]);

  const handleAmountChange = useCallback((text: string) => {
    // Allow empty, numbers, and decimal point
    if (text === "" || /^\d*\.?\d*$/.test(text)) {
      setAmount(text);
    }
  }, []);

  const isValid = useMemo(() => {
    const amountValue = Number(amount);
    return name.trim().length > 0 && amountValue > 0;
  }, [name, amount]);

  return (
    <View style={styles.container}>
      {/* Button Header */}
      <View style={styles.buttonHeader}>
        <IOSButton
          variant="glass"
          controlSize="small"
          systemIcon="xmark"
          iconColor={colors.primaryText}
          iconPadding={{ vertical: theme.spacing.xs * 1.5 }}
          onPress={handleCancel}
        />
        <IOSButton
          variant="glassProminent"
          controlSize="small"
          systemIcon="checkmark"
          iconColor={colors.black}
          buttonColor={colors.accent}
          iconPadding={{ vertical: theme.spacing.xs * 1.5 }}
          onPress={handleSave}
          disabled={!isValid}
        />
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <AppText role="Title2">
          {isAdding ? "New Ingredient" : "Edit Ingredient"}
        </AppText>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        {/* Name Input */}
        <View style={styles.fieldGroup}>
          <AppText role="Caption" color="secondary" style={styles.label}>
            Name
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Chicken Breast"
            placeholderTextColor={colors.secondaryText}
            style={styles.textInput}
            keyboardAppearance={colorScheme}
            returnKeyType="next"
            autoFocus={isAdding}
          />
        </View>

        {/* Amount and Unit Row */}
        <View style={styles.rowGroup}>
          {/* Amount Input */}
          <View style={[styles.fieldGroup, styles.flexField]}>
            <AppText role="Caption" color="secondary" style={styles.label}>
              Amount
            </AppText>
            <TextInput
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="150"
              placeholderTextColor={colors.secondaryText}
              style={styles.textInput}
              keyboardType="decimal-pad"
              keyboardAppearance={colorScheme}
            />
          </View>

          {/* Unit Selector */}
          <View style={[styles.fieldGroup, styles.unitField]}>
            <AppText role="Caption" color="secondary" style={styles.label}>
              Unit
            </AppText>
            <Host matchContents style={{ flex: 1 }}>
              <ContextMenu
                modifiers={[buttonStyle("glass")]}
                activationMethod="singlePress"
              >
                <ContextMenu.Items>
                  <Picker
                    selectedIndex={UNIT_OPTIONS.indexOf(unit)}
                    options={UNIT_OPTIONS}
                    onOptionSelected={({ nativeEvent: { index } }) =>
                      handleUnitSelect(index)
                    }
                    modifiers={[
                      padding({
                        horizontal: theme.spacing.md,
                        vertical: theme.spacing.sm,
                      }),
                    ]}
                    variant="inline"
                  />
                </ContextMenu.Items>
                <ContextMenu.Trigger>
                  <HStack
                    spacing={theme.spacing.xs}
                    modifiers={[
                      padding({
                        horizontal: theme.spacing.md,
                        vertical: theme.spacing.sm,
                      }),
                      frame({ minWidth: 100 }),
                    ]}
                  >
                    <Text>{unit}</Text>
                    <Image
                      systemName="chevron.down"
                      size={16}
                      color={colors.secondaryText}
                    />
                  </HStack>
                </ContextMenu.Trigger>
              </ContextMenu>
            </Host>
          </View>
        </View>
      </View>
    </View>
  );
};
