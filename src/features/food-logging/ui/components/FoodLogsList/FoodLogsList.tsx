import React from 'react';
import Animated, {
  Layout,
  FadeInUp,
} from 'react-native-reanimated';
import {
  SwipeToDelete,
  SkeletonCard,
} from '../../../../../shared/ui';
import { FoodLogCard } from '../../FoodLogCard';
import { FoodLog } from '../../../../../types';
import { styles } from './FoodLogsList.styles';

interface FoodLogsListProps {
  isLoadingLogs: boolean;
  foodLogs: FoodLog[];
  onDeleteLog: (logId: string) => Promise<void>;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogsList: React.FC<FoodLogsListProps> = ({
  isLoadingLogs,
  foodLogs,
  onDeleteLog,
  onAddInfo,
}) => {
  const handleDeleteLog = async (logId: string) => {
    await onDeleteLog(logId);
  };

  if (isLoadingLogs) {
    return (
      <Animated.View style={styles.container}>
        {[1, 2, 3].map((i) => (
          <Animated.View
            key={i}
            entering={FadeInUp.delay(i * 80)
              .springify()
              .damping(18)
              .stiffness(150)}
            layout={Layout.springify().damping(18).stiffness(150).mass(1)}
          >
            <SkeletonCard />
          </Animated.View>
        ))}
      </Animated.View>
    );
  }

  return (
    <>
      {foodLogs.map((log, index) => (
        <Animated.View
          key={log.id}
          entering={FadeInUp.delay(index * 80)
            .springify()
            .damping(18)
            .stiffness(150)}
          layout={Layout.springify().damping(18).stiffness(150).mass(1)}
        >
          <SwipeToDelete onDelete={() => handleDeleteLog(log.id)}>
            <FoodLogCard foodLog={log} onAddInfo={onAddInfo} />
          </SwipeToDelete>
        </Animated.View>
      ))}
    </>
  );
};