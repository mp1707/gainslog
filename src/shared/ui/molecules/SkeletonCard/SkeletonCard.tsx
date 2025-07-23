import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/shared/ui/atoms';
import { styles } from './SkeletonCard.styles';

export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Skeleton width="70%" height={20} style={styles.title} />
      <View style={styles.macros}>
        <Skeleton width="20%" height={16} />
        <Skeleton width="20%" height={16} />
        <Skeleton width="20%" height={16} />
        <Skeleton width="20%" height={16} />
      </View>
    </View>
  );
};