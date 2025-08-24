import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Stack } from "expo-router";
import { X, ArrowsClockwise, Star, PencilSimple } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import {
  estimateNutritionImageBased,
  estimateNutritionTextBased,
} from "@/lib/supabase";
import { useTheme, useThemedStyles } from "@/theme";
import { useAppStore } from "@/store";
import { FoodLog } from "@/types";
import { ImageSection } from "@/components/detail-page/ImageSection";
import { MetadataSection } from "@/components/detail-page/MetadataSection";
import { NutritionEditCard } from "@/components/detail-page/NutritionEditCard";
import { NutritionViewCard } from "@/components/detail-page/NutritionViewCard";

export default function FoodLogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const foodLogs = useAppStore((s) => s.foodLogs);
  const favorites = useAppStore((s) => s.favorites);
  const updateFoodLog = useAppStore((s) => s.updateFoodLog);
  const deleteFoodLog = useAppStore((s) => s.deleteFoodLog);
  const toggleFavoriteForLog = useAppStore((s: any) => s.toggleFavoriteForLog);
  const isFavoriteForLog = useAppStore((s: any) => s.isFavoriteForLog);

  // Find the food log by ID
  const originalLog = foodLogs.find((log) => log.id === id);

  // View/Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedLog, setEditedLog] = useState<FoodLog | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isReEstimating, setIsReEstimating] = useState(false);

  // Re-estimation can be added via useFoodEstimation if needed

  // Initialize local state when log is found
  useEffect(() => {
    if (originalLog) {
      setEditedLog(originalLog);
    }
  }, [originalLog]);

  // Dynamic navigation header based on edit mode
  useLayoutEffect(() => {
    const logTitle =
      originalLog?.userTitle || originalLog?.generatedTitle || "Food Log";

    navigation.setOptions({
      title: isEditing ? "Edit Log" : logTitle,
      headerLeft: () =>
        isEditing ? (
          <TouchableOpacity
            onPress={handleCancel}
            style={{ marginLeft: 10 }}
            accessibilityLabel="Cancel editing"
            accessibilityHint="Discards changes and returns to view mode"
          >
            <Text style={[styles.navButtonText, { color: colors.accent }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 10 }}
            accessibilityLabel="Go back"
            accessibilityHint="Returns to previous screen"
          >
            <X size={24} color={colors.primaryText} />
          </TouchableOpacity>
        ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          {isEditing ? (
            <TouchableOpacity
              onPress={handleSave}
              accessibilityLabel="Save changes"
              accessibilityHint="Saves edits and returns to view mode"
            >
              <Text
                style={[
                  styles.navButtonText,
                  styles.navButtonDone,
                  { color: colors.accent },
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                accessibilityLabel="Edit food log"
                accessibilityHint="Switches to edit mode to modify this log entry"
              >
                <Text style={[styles.navButtonText, { color: colors.accent }]}>
                  Edit
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ),
    });
  }, [navigation, isEditing, originalLog, colors]);

  // If log not found, show error
  if (!originalLog) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Food log not found
        </Text>
      </View>
    );
  }

  const currentLog = editedLog || originalLog;

  const handleFieldUpdate = (field: keyof FoodLog, value: any) => {
    setEditedLog((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      setHasChanges(true);
      return updated;
    });
  };

  const handleNutritionUpdate = (field: string, value: number) => {
    setEditedLog((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      setHasChanges(true);
      return updated;
    });
  };

  const toggleFavorite = async () => {
    if (!originalLog) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavoriteForLog(originalLog);
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setEditedLog(originalLog);
              setHasChanges(false);
              setIsEditing(false);
            },
          },
        ]
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (editedLog && hasChanges) {
      await updateFoodLog(editedLog.id, editedLog);
      setHasChanges(false);
    }
    setIsEditing(false);
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
            await deleteFoodLog(currentLog.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleReEstimate = async () => {
    if (!currentLog || isReEstimating) return;

    const hasTitle = currentLog.userTitle || currentLog.generatedTitle;
    const hasImage = currentLog.imageUrl;

    if (!hasTitle && !hasImage) {
      Alert.alert(
        "Nothing to Estimate",
        "Please add a title or image to enable nutrition estimation."
      );
      return;
    }

    setIsReEstimating(true);

    try {
      const title = currentLog.userTitle || currentLog.generatedTitle || "";
      const description =
        currentLog.userDescription ||
        currentLog.generatedDescription ||
        undefined;

      const response = hasImage
        ? await estimateNutritionImageBased({
            imageUrl: currentLog.imageUrl as string,
            title: title || undefined,
            description,
          })
        : await estimateNutritionTextBased({
            title: title || undefined,
            description,
          });

      if (response.generatedTitle === "Invalid Image") {
        Alert.alert(
          "Invalid Image",
          "The selected image could not be processed. Please try a different image."
        );
        return;
      }

      const updates: Partial<FoodLog> = {
        generatedTitle: response.generatedTitle,
        generatedCalories: response.calories,
        generatedProtein: response.protein,
        generatedCarbs: response.carbs,
        generatedFat: response.fat,
        estimationConfidence: response.estimationConfidence,
      };

      await updateFoodLog(currentLog.id, updates);
      setEditedLog((prev) => (prev ? { ...prev, ...updates } : prev));

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primaryBackground },
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: "600",
            fontFamily: "Nunito-SemiBold",
            color: colors.primaryText,
          },
        }}
      />

      <ScrollView
        style={[
          styles.container,
          { backgroundColor: colors.primaryBackground },
        ]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Image Section */}
        <ImageSection
          log={currentLog}
          isEditing={isEditing}
          onLogUpdate={(updatedLog: FoodLog) => {
            setEditedLog(updatedLog);
            setHasChanges(true);
          }}
        />

        {/* Title and Description */}
        <View style={styles.generalSection}>
          {isEditing ? (
            <>
              <TextInput
                style={[
                  styles.titleInput,
                  {
                    color: colors.primaryText,
                    backgroundColor: colors.secondaryBackground,
                    borderColor: colors.border,
                  },
                ]}
                value={currentLog.userTitle || currentLog.generatedTitle || ""}
                onChangeText={(text) => handleFieldUpdate("userTitle", text)}
                placeholder="Food title"
                placeholderTextColor={colors.secondaryText}
                multiline
                accessibilityLabel="Food title"
                accessibilityHint="Enter or edit the name of the food item"
              />
              <TextInput
                style={[
                  styles.descriptionInput,
                  {
                    color: colors.primaryText,
                    backgroundColor: colors.secondaryBackground,
                    borderColor: colors.border,
                  },
                ]}
                value={currentLog.userDescription || ""}
                onChangeText={(text) =>
                  handleFieldUpdate("userDescription", text)
                }
                placeholder="Add a description..."
                placeholderTextColor={colors.secondaryText}
                multiline
                numberOfLines={3}
                accessibilityLabel="Food description"
                accessibilityHint="Enter additional details about the food item"
              />
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.primaryText }]}>
                {currentLog.userTitle || currentLog.generatedTitle}
              </Text>
              {(currentLog.userDescription ||
                currentLog.generatedDescription) && (
                <Text
                  style={[styles.description, { color: colors.secondaryText }]}
                >
                  {currentLog.userDescription ||
                    currentLog.generatedDescription}
                </Text>
              )}
            </>
          )}
        </View>

        {/* Nutrition Section */}
        <View style={styles.nutritionSection}>
          <View style={styles.nutritionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
              Nutrition
            </Text>
            <TouchableOpacity
              onPress={toggleFavorite}
              style={styles.favoriteButton}
              accessibilityLabel={
                originalLog && isFavoriteForLog(originalLog)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              accessibilityHint={
                originalLog && isFavoriteForLog(originalLog)
                  ? "Removes this log from your favorites"
                  : "Adds this log to your favorites"
              }
            >
              <Star
                size={20}
                color={colors.accent}
                weight={
                  originalLog && isFavoriteForLog(originalLog)
                    ? "fill"
                    : "regular"
                }
              />
              <Text
                style={[styles.favoriteButtonText, { color: colors.accent }]}
              >
                {originalLog && isFavoriteForLog(originalLog)
                  ? "Favorited"
                  : "Add to Favorites"}
              </Text>
            </TouchableOpacity>
          </View>
          {isEditing ? (
            <NutritionEditCard
              log={currentLog}
              onUpdateNutrition={handleNutritionUpdate}
            />
          ) : (
            <NutritionViewCard log={currentLog} />
          )}
        </View>

        {/* Re-estimation Button - Available in both modes */}
        <View style={styles.actionsSection}>
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
            accessibilityLabel="Re-estimate nutrition with AI"
            accessibilityHint="Uses AI to generate new nutrition estimates based on the current title and image"
            accessibilityState={{ busy: isReEstimating }}
          >
            {isReEstimating ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <ArrowsClockwise size={16} color={colors.accent} />
            )}
            <Text
              style={[styles.reEstimateButtonText, { color: colors.accent }]}
            >
              {isReEstimating ? "Estimating..." : "Re-estimate with AI"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Metadata Section - Only in view mode */}
        {!isEditing && <MetadataSection log={currentLog} />}

        {/* Delete Button */}
        <View style={styles.deleteSection}>
          <TouchableOpacity
            onPress={handleDelete}
            accessibilityLabel="Delete food log"
            accessibilityHint="Permanently deletes this log entry. This action cannot be undone."
            accessibilityRole="button"
          >
            <Text style={[styles.deleteButtonText, { color: colors.error }]}>
              Delete Log
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
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
    headerRightContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 10,
    },
    navButtonText: {
      ...theme.typography.Body,
      fontSize: 17,
    },
    navButtonDone: {
      ...theme.typography.Headline,
      fontWeight: "600",
    },
    generalSection: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingVertical: theme.spacing.lg,
    },
    title: {
      ...theme.typography.Title1,
      marginBottom: theme.spacing.sm,
    },
    description: {
      ...theme.typography.Body,
      lineHeight: 22,
    },
    titleInput: {
      ...theme.typography.Title1,
      borderWidth: 1,
      borderRadius: theme.components.buttons.cornerRadius,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      minHeight: 50,
      textAlignVertical: "top",
    },
    descriptionInput: {
      ...theme.typography.Body,
      borderWidth: 1,
      borderRadius: theme.components.buttons.cornerRadius,
      padding: theme.spacing.md,
      minHeight: 80,
      textAlignVertical: "top",
    },
    nutritionSection: {
      marginVertical: theme.spacing.lg,
    },
    nutritionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.Headline,
    },
    favoriteButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    favoriteButtonText: {
      ...theme.typography.Body,
      fontSize: 15,
      fontWeight: "500",
    },
    actionsSection: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      alignItems: "center",
      marginVertical: theme.spacing.lg,
    },
    reEstimateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1.5,
      borderRadius: theme.components.buttons.cornerRadius,
      gap: theme.spacing.xs,
      minWidth: 160,
    },
    reEstimateButtonText: {
      ...theme.typography.Body,
      fontWeight: "500",
    },
    deleteSection: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingVertical: theme.spacing.xl,
      alignItems: "center",
    },
    deleteButtonText: {
      ...theme.typography.Body,
      fontWeight: "600",
    },
  });
