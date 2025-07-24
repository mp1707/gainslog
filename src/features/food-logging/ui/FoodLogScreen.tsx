import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SwipeToDelete, SkeletonCard } from "@/shared/ui";
import { FoodLogCard } from "./FoodLogCard";
import { NutritionHeader } from "./NutritionHeader";
import { FoodLog } from "../../../types";
import { styles } from "./FoodLogScreen.styles";
import { useFoodLogStore } from "../../../stores/useFoodLogStore";

interface FoodLogScreenProps {
  isLoadingLogs: boolean;
  onDeleteLog: (logId: string) => Promise<void>;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogScreen: React.FC<FoodLogScreenProps> = ({
  isLoadingLogs,
  onDeleteLog,
  onAddInfo,
}) => {
  const {
    triggerManualLog,
    triggerImageCapture,
    getFilteredFoodLogs,
  } = useFoodLogStore();

  const filteredFoodLogs = getFilteredFoodLogs();

  const handleDeleteLog = async (logId: string) => {
    await onDeleteLog(logId);
  };

  const handleTextLog = () => {
    triggerManualLog();
  };

  const handleImageLog = () => {
    triggerImageCapture();
  };

  return (
    <SafeAreaView style={styles.container}>
      <NutritionHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoadingLogs ? (
          <View>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </View>
        ) : (
          filteredFoodLogs.map((log) => (
            <SwipeToDelete
              key={log.id}
              itemId={log.id}
              onDelete={() => handleDeleteLog(log.id)}
            >
              <FoodLogCard foodLog={log} onAddInfo={onAddInfo} />
            </SwipeToDelete>
          ))
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleTextLog}
          activeOpacity={0.8}
        >
          <FontAwesome name="pencil" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fabButton, styles.fabButtonSecondary]}
          onPress={handleImageLog}
          activeOpacity={0.8}
        >
          <FontAwesome name="camera" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
