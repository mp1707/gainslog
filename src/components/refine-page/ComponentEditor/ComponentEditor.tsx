import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { View, Pressable, Platform, Keyboard } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Picker } from "@react-native-picker/picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ChevronDown } from "lucide-react-native";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button/Button";
import { useTheme } from "@/theme";
import { createStyles } from "./ComponentEditor.styles";
import type { FoodComponent } from "@/types/models";

interface ComponentEditorProps {
  component: FoodComponent | null;
  isAdding: boolean;
  onSave: (component: FoodComponent) => void;
  onCancel: () => void;
}

const UNIT_OPTIONS: FoodComponent["unit"][] = [
  "g",
  "oz",
  "ml",
  "fl oz",
  "cup",
  "tbsp",
  "tsp",
  "scoop",
  "piece",
  "serving",
];

export const ComponentEditor: React.FC<ComponentEditorProps> = ({
  component,
  isAdding,
  onSave,
  onCancel,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, theme),
    [colors, theme]
  );

  // Form state
  const [name, setName] = useState(component?.name || "");
  const [amount, setAmount] = useState(
    component?.amount ? String(component.amount) : ""
  );
  const [unit, setUnit] = useState<FoodComponent["unit"]>(
    component?.unit || "g"
  );
  const [showUnitPicker, setShowUnitPicker] = useState(false);

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

  const handleUnitPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Dismiss keyboard before opening picker
    Keyboard.dismiss();
    setShowUnitPicker(true);
  }, []);

  const handleUnitPickerDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowUnitPicker(false);
  }, []);

  const handleSave = useCallback(() => {
    const amountValue = Number(amount);
    if (name.trim() && amountValue > 0) {
      onSave({
        name: name.trim(),
        amount: amountValue,
        unit,
        needsRefinement: false,
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
      {/* Header */}
      <View style={styles.header}>
        <AppText role="Title2">
          {isAdding ? "New Ingredient" : "Edit Ingredient"}
        </AppText>
      </View>

      {showUnitPicker ? (
        /* Unit Picker Mode */
        <>
          <View style={styles.pickerHeader}>
            <AppText role="Headline">Select Unit</AppText>
            <Pressable onPress={handleUnitPickerDone} style={styles.doneButton}>
              <AppText role="Headline" color="accent">
                Done
              </AppText>
            </Pressable>
          </View>
          <Picker
            selectedValue={unit}
            onValueChange={(value) => setUnit(value as FoodComponent["unit"])}
            itemStyle={Platform.OS === "ios" ? styles.pickerItemIOS : undefined}
            style={styles.picker}
          >
            {UNIT_OPTIONS.map((u) => (
              <Picker.Item key={u} label={u} value={u} />
            ))}
          </Picker>
        </>
      ) : (
        /* Form Mode */
        <>
          <View style={styles.formSection}>
            {/* Name Input */}
            <View style={styles.fieldGroup}>
              <AppText role="Caption" color="secondary" style={styles.label}>
                Name
              </AppText>
              <BottomSheetTextInput
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
                <BottomSheetTextInput
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
                <Pressable
                  onPress={handleUnitPress}
                  style={({ pressed }) => [
                    styles.unitSelector,
                    pressed && styles.unitSelectorPressed,
                  ]}
                >
                  <AppText role="Body">{unit}</AppText>
                  <ChevronDown size={20} color={colors.secondaryText} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <View style={styles.buttonWrapper}>
              <Button
                label="Cancel"
                variant="tertiary"
                onPress={handleCancel}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                label="Save"
                variant="primary"
                onPress={handleSave}
                disabled={!isValid}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
};
