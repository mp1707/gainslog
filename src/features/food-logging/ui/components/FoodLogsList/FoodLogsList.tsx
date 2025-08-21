import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import Animated, { Layout, FadeInUp } from "react-native-reanimated";
import { SwipeToDelete, SkeletonCard } from "../../../../../shared/ui";
import { AppText } from "@/components/AppText";
import { FoodLog } from "@/types";
import { useTheme } from "@/providers";
import { styles } from "./FoodLogsList.styles";
import { FoodLogCard } from "../FoodLogCard";
import { LogCard } from "../LogCard";

interface FoodLogsListProps {
  isLoadingLogs: boolean;
  foodLogs: FoodLog[];
  onDeleteLog: (logId: string) => Promise<void>;
  onAddInfo: (log: FoodLog) => void;
}

export const FoodLogsList: React.FC<FoodLogsListProps> = React.memo(
  ({ isLoadingLogs, foodLogs, onDeleteLog, onAddInfo }) => {
    const { theme, colors } = useTheme();

    const handleDeleteLog = useCallback(
      async (logId: string) => {
        await onDeleteLog(logId);
      },
      [onDeleteLog]
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
          <AppText role="Headline" style={headerStyle}>
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
        <AppText role="Headline" style={headerStyle}>
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
              <SwipeToDelete onDelete={() => handleDeleteLog(log.id)}>
                {/* <FoodLogCard foodLog={log} onAddInfo={onAddInfo} /> */}
                <LogCard foodLog={log} onAddInfo={onAddInfo} />
              </SwipeToDelete>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }
);
