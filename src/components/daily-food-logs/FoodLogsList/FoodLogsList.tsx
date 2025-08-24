import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import Animated, { Layout, FadeInUp } from "react-native-reanimated";

import { AppText } from "@/components/shared/AppText";
import { FoodLog } from "@/types";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store";
import { styles } from "./FoodLogsList.styles";
import { LogCard } from "../LogCard";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { SkeletonCard } from "./SkeletonCard/SkeletonCard";

interface FoodLogsListProps {
  isLoadingLogs: boolean;
  foodLogs: FoodLog[];
  onDeleteLog: (logId: string) => void;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogsList: React.FC<FoodLogsListProps> = React.memo(
  ({ isLoadingLogs, foodLogs, onDeleteLog, onAddInfo }) => {
    const { theme, colors } = useTheme();
    const toggleFavoriteForLog = useAppStore((s) => s.toggleFavoriteForLog);

    const handleDeleteLog = useCallback(
      async (logId: string) => {
        await onDeleteLog(logId);
      },
      [onDeleteLog]
    );

    const handleFavoriteLog = useCallback(
      async (log: FoodLog) => {
        toggleFavoriteForLog?.(log);
      },
      [toggleFavoriteForLog]
    );

    const headerStyle = useMemo(
      () => ({
        color: colors.primaryText,
        marginBottom: theme.spacing.md,
      }),
      [colors.primaryText, theme.spacing.md]
    );

    if (isLoadingLogs) {
      return (
        <View>
          <AppText role="Title2" style={headerStyle}>
            Logs
          </AppText>
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
        </View>
      );
    }

    return (
      <View>
        <AppText role="Title2" style={headerStyle}>
          Logs
        </AppText>
        <View style={styles.container}>
          {foodLogs.map((log, index) => (
            <Animated.View
              key={log.id}
              entering={FadeInUp.delay(index * 80)
                .springify()
                .damping(18)
                .stiffness(150)}
              layout={Layout.springify().damping(18).stiffness(150).mass(1)}
            >
              <SwipeToFunctions
                onDelete={() => handleDeleteLog(log.id)}
                onFavorite={() => handleFavoriteLog(log)}
              >
                {/* <FoodLogCard foodLog={log} onAddInfo={onAddInfo} /> */}
                <LogCard foodLog={log} onAddInfo={onAddInfo} />
              </SwipeToFunctions>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }
);
