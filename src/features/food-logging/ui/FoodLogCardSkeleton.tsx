import React from 'react';
import { View } from 'react-native';
import { Camera } from 'phosphor-react-native';
import { Skeleton } from '@/shared/ui/atoms';
import { SkeletonShimmerEffect } from '../../../components/SkeletonShimmerEffect';
import { Card } from '../../../components/Card';
import { FoodLog } from '../../../types';
import { useTheme } from '../../../providers/ThemeProvider';
import { createStyles } from './FoodLogCard.styles';

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
        <View style={styles.titleRow}>
          <View style={styles.titleContent}>
            <View style={styles.titleWithIcon}>
              {foodLog.imageUrl && (
                <Camera 
                  size={16} 
                  color={colors.disabledText}
                  weight="regular"
                  style={styles.cameraIcon}
                />
              )}
              <Skeleton width="75%" height={17} style={styles.title} />
            </View>
            {foodLog.userDescription && (
              <Skeleton width="60%" height={15} style={styles.description} />
            )}
          </View>
          <View style={styles.rightSection}>
            {/* Badge skeleton */}
            <Skeleton width={80} height={28} style={{ borderRadius: 8 }} />
          </View>
        </View>
        
        {/* MacroRow skeleton - 4 nutrition values */}
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Skeleton width={40} height={13} style={{ marginBottom: 4 }} />
            <Skeleton width={30} height={15} />
          </View>
          <View style={styles.macroItem}>
            <Skeleton width={45} height={13} style={{ marginBottom: 4 }} />
            <Skeleton width={25} height={15} />
          </View>
          <View style={styles.macroItem}>
            <Skeleton width={35} height={13} style={{ marginBottom: 4 }} />
            <Skeleton width={30} height={15} />
          </View>
          <View style={styles.macroItem}>
            <Skeleton width={25} height={13} style={{ marginBottom: 4 }} />
            <Skeleton width={20} height={15} />
          </View>
        </View>
      </Card>
    </SkeletonShimmerEffect>
  );
};