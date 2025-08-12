import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/shared/ui/atoms";
import { SkeletonShimmerEffect, Card } from "@/components";
import { FoodLog } from "@/types";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./FoodLogCard.styles";

interface FoodLogCardSkeletonProps {
  foodLog: FoodLog;
}

export const FoodLogCardSkeleton: React.FC<FoodLogCardSkeletonProps> = ({
  foodLog,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SkeletonShimmerEffect isActive={true}>
      <Card style={styles.card}>
        <View style={styles.topSection}>
          <View style={styles.titleSection}>
            <Skeleton width="75%" height={17} style={styles.title} />
            <Skeleton width={80} height={28} style={{ borderRadius: 8 }} />
          </View>
          {foodLog.userDescription && (
            <Skeleton width="60%" height={15} style={styles.description} />
          )}
        </View>

        <View style={styles.bottomSection}>
          {(foodLog.imageUrl || foodLog.localImageUri) && (
            <Skeleton width={40} height={28} style={{ borderRadius: 8 }} />
          )}
          <View style={styles.macroRowContainer}>
            <Skeleton width={65} height={28} style={{ borderRadius: 8 }} />
            <Skeleton width={45} height={28} style={{ borderRadius: 8 }} />
            <Skeleton width={45} height={28} style={{ borderRadius: 8 }} />
            <Skeleton width={40} height={28} style={{ borderRadius: 8 }} />
          </View>
        </View>
      </Card>
    </SkeletonShimmerEffect>
  );
};
