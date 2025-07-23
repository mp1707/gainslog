import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SwipeToDelete, SkeletonCard } from "@/shared/ui";
import { FoodLogCard } from "./FoodLogCard";
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
    selectedDate, 
    setSelectedDate, 
    getFilteredFoodLogs 
  } = useFoodLogStore();
  
  const filteredFoodLogs = getFilteredFoodLogs();

  // Helper function to convert Date to local date string (YYYY-MM-DD)
  const dateToLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const dateString = dateToLocalDateString(selectedDate);
      setSelectedDate(dateString);
    }
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>Food Logs</Text>
        
        {/* Native Date Picker */}
        <DateTimePicker
          value={new Date(selectedDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          style={styles.datePicker}
        />
      </View>

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
