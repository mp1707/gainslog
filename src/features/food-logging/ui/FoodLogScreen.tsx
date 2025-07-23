import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { SwipeToDelete, SkeletonCard } from '@/shared/ui';
import { FoodLogCard } from './FoodLogCard';
import { FoodLog } from '../../../types';
import { styles } from './FoodLogScreen.styles';

interface FoodLogScreenProps {
  foodLogs: FoodLog[];
  isLoadingLogs: boolean;
  onDeleteLog: (logId: string) => Promise<void>;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogScreen: React.FC<FoodLogScreenProps> = ({
  foodLogs,
  isLoadingLogs,
  onDeleteLog,
  onAddInfo,
}) => {

  const handleDeleteLog = async (logId: string) => {
    await onDeleteLog(logId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Logs</Text>
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
          foodLogs.map((log) => (
            <SwipeToDelete
              key={log.id}
              itemId={log.id}
              onDelete={() => handleDeleteLog(log.id)}
            >
              <FoodLogCard 
                foodLog={log}
                onAddInfo={onAddInfo}
              />
            </SwipeToDelete>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};