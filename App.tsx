import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "./lib/supabase";

interface FoodLog {
  id: string;
  userDescription?: string;
  generatedTitle: string;
  estimationConfidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const mockFoodLogs: FoodLog[] = [
  {
    id: "1",
    generatedTitle: "Chicken with rice",
    calories: 100,
    estimationConfidence: 85,
    protein: 10,
    carbs: 20,
    fat: 30,
  },
  {
    id: "2",
    generatedTitle: "Salad with nuts",
    calories: 100,
    estimationConfidence: 45,
    protein: 10,
    carbs: 20,
    fat: 30,
  },
  {
    id: "3",
    generatedTitle: "Pizza slice",
    calories: 320,
    estimationConfidence: 25,
    protein: 15,
    carbs: 35,
    fat: 18,
  },
];

const mockAddedFoodLog = {
  generatedTitle: "New log entry!",
  calories: 100,
  estimationConfidence: 80,
  protein: 10,
  carbs: 20,
  fat: 30,
};

export default function App() {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>(mockFoodLogs);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddFoodLog = async () => {
    try {
      setIsUploading(true);

      // Request camera permissions first
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== "granted") {
        throw new Error("Camera permission not granted");
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      const resizedImageUri = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1000 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const filename = `public/food-image-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append("file", {
        uri: resizedImageUri.uri,
        name: filename,
        type: "image/jpeg",
      } as any);

      const { error: uploadError } = await supabase.storage
        .from("food-images")
        .upload(filename, formData);

      if (uploadError) {
        throw uploadError;
      }

      const newLog: FoodLog = {
        id: Date.now().toString(),
        ...mockAddedFoodLog,
      };

      setFoodLogs((prev) => [newLog, ...prev]);
    } catch (error) {
      console.error("Error adding food log:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Food Logs</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {foodLogs.map((log) => (
          <View key={log.id} style={styles.logCard}>
            <View style={styles.titleRow}>
              <Text style={styles.logTitle}>
                {log.userDescription || log.generatedTitle}
              </Text>
              <Text style={[
                styles.confidenceText,
                log.estimationConfidence <= 30 && styles.confidenceLow,
                log.estimationConfidence >= 31 && log.estimationConfidence <= 70 && styles.confidenceMedium,
                log.estimationConfidence >= 71 && styles.confidenceHigh,
              ]}>
                {log.estimationConfidence}%
              </Text>
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>P:</Text>
                <Text style={styles.macroValue}>{log.protein}</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>C:</Text>
                <Text style={styles.macroValue}>{log.carbs}</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>F:</Text>
                <Text style={styles.macroValue}>{log.fat}</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Cal:</Text>
                <Text style={styles.macroValue}>{log.calories}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, isUploading && styles.addButtonDisabled]}
        onPress={handleAddFoodLog}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.addButtonText}>+</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  logCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#f3f4f6",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 12,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  confidenceLow: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  confidenceMedium: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
  },
  confidenceHigh: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f3f4f6",
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginRight: 4,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  addButton: {
    position: "absolute",
    bottom: 34,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowColor: "#9ca3af",
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: "300",
    color: "#ffffff",
    lineHeight: 28,
  },
});
