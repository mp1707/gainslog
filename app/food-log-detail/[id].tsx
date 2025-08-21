import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Stack } from "expo-router";
import { X, ArrowsClockwise } from "phosphor-react-native";
import { useTheme } from "@/providers";
import { useFoodLogStore, selectFoodLogs } from "@/stores/useFoodLogStore";
import { useUpdateFoodLog } from "@/features/food-logging/hooks";
import { FoodLog } from "@/types";
import { theme } from "@/theme";

// Import components
import {
  Section,
  EditableTextRow,
  EditableNutritionRow,
  ImagePickerSection,
} from "@/features/food-logging/ui/detail";

export default function FoodLogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { colors } = useTheme();
  
  const foodLogs = useFoodLogStore(selectFoodLogs);
  const { updateFoodLogById, deleteFoodLogById } = useFoodLogStore();
  
  // Find the food log by ID
  const originalLog = foodLogs.find(log => log.id === id);
  
  // Local state for editing
  const [editedLog, setEditedLog] = useState<FoodLog | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isReEstimating, setIsReEstimating] = useState(false);
  
  // Hook for re-estimation
  const { update } = useUpdateFoodLog();

  // Initialize local state when log is found
  useEffect(() => {
    if (originalLog && !editedLog) {
      setEditedLog(originalLog);
    }
  }, [originalLog, editedLog]);

  // If log not found, show error
  if (!originalLog || !editedLog) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Food log not found
        </Text>
      </View>
    );
  }

  const handleFieldUpdate = (field: keyof FoodLog, value: any) => {
    setEditedLog(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = async () => {
    if (editedLog && hasChanges) {
      await updateFoodLogById(editedLog);
      setHasChanges(false);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Log",
      "Are you sure you want to permanently delete this log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteFoodLogById(editedLog.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to save them?",
        [
          { text: "Don't Save", style: "destructive", onPress: () => router.back() },
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: handleSave },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleReEstimate = async () => {
    if (!editedLog || isReEstimating) return;
    
    // Check if there's something to re-estimate
    const hasTitle = editedLog.userTitle || editedLog.generatedTitle;
    const hasImage = editedLog.imageUrl;
    
    if (!hasTitle && !hasImage) {
      Alert.alert(
        "Nothing to Estimate",
        "Please add a title or image to enable nutrition estimation."
      );
      return;
    }

    setIsReEstimating(true);
    
    try {
      // Create a copy of the log with re-estimation flag
      const logToReEstimate = {
        ...editedLog,
        needsAiEstimation: true,
        // Clear existing AI-generated nutrition for fresh estimation
        calories: editedLog.userCalories || 0,
        protein: editedLog.userProtein || 0,
        carbs: editedLog.userCarbs || 0,
        fat: editedLog.userFat || 0,
        estimationConfidence: undefined,
      };
      
      await update(logToReEstimate);
      setHasChanges(true);
    } catch (error) {
      console.error("Error re-estimating nutrition:", error);
      Alert.alert(
        "Estimation Failed",
        "Unable to re-estimate nutrition. Please try again."
      );
    } finally {
      setIsReEstimating(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Edit Log",
          headerStyle: { backgroundColor: colors.primaryBackground },
          headerTitleStyle: {
            ...theme.typography.Headline,
            color: colors.primaryText,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={{ marginLeft: 10 }}>
              <X size={24} color={colors.primaryText} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Text style={[styles.doneButton, { color: colors.accent }]}>
                Done
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView
        style={[styles.container, { backgroundColor: colors.primaryBackground }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Media Section */}
        <ImagePickerSection
          log={editedLog}
          onLogUpdate={(updatedLog) => setEditedLog(updatedLog)}
        />

        {/* General Section */}
        <Section title="General">
          <EditableTextRow
            label="Title"
            value={editedLog.userTitle || editedLog.generatedTitle}
            onChangeText={(text) => handleFieldUpdate("userTitle", text)}
            placeholder="e.g., Grilled Chicken Salad"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <EditableTextRow
            label="Description"
            value={editedLog.userDescription || ""}
            onChangeText={(text) => handleFieldUpdate("userDescription", text)}
            placeholder="Add a note..."
            multiline
            showMicButton
          />
        </Section>

        {/* Nutrition Section */}
        <Section title="Nutrition">
          <EditableNutritionRow
            label="Calories"
            value={editedLog.userCalories || editedLog.calories}
            unit="kcal"
            onPress={() => {
              // TODO: Navigate to nutrition editor
              console.log("Edit calories");
            }}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <EditableNutritionRow
            label="Protein"
            value={editedLog.userProtein || editedLog.protein}
            unit="g"
            onPress={() => {
              // TODO: Navigate to nutrition editor
              console.log("Edit protein");
            }}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <EditableNutritionRow
            label="Carbs"
            value={editedLog.userCarbs || editedLog.carbs}
            unit="g"
            onPress={() => {
              // TODO: Navigate to nutrition editor
              console.log("Edit carbs");
            }}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <EditableNutritionRow
            label="Fat"
            value={editedLog.userFat || editedLog.fat}
            unit="g"
            onPress={() => {
              // TODO: Navigate to nutrition editor
              console.log("Edit fat");
            }}
          />
          
          {/* Re-estimation Button */}
          <TouchableOpacity
            style={[
              styles.reEstimateButton,
              {
                backgroundColor: "transparent",
                borderColor: colors.accent,
                opacity: isReEstimating ? 0.6 : 1,
              },
            ]}
            onPress={handleReEstimate}
            disabled={isReEstimating}
          >
            {isReEstimating ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <ArrowsClockwise size={16} color={colors.accent} />
            )}
            <Text style={[styles.reEstimateButtonText, { color: colors.accent }]}>
              {isReEstimating ? "Estimating..." : "Estimate again"}
            </Text>
          </TouchableOpacity>
        </Section>

        {/* Actions Section */}
        <Section title="Actions">
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={[styles.deleteButtonText, { color: colors.error }]}>
              Delete Log
            </Text>
          </TouchableOpacity>
        </Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.pageMargins.horizontal,
    paddingBottom: theme.spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    ...theme.typography.Body,
  },
  doneButton: {
    ...theme.typography.Headline,
    marginRight: 10,
  },
  divider: {
    height: 1,
    marginLeft: theme.spacing.md,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  deleteButtonText: {
    ...theme.typography.Body,
    fontWeight: "600",
  },
  reEstimateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1.5,
    borderRadius: theme.components.buttons.cornerRadius,
    gap: theme.spacing.xs,
  },
  reEstimateButtonText: {
    ...theme.typography.Body,
    fontWeight: "500",
  },
});