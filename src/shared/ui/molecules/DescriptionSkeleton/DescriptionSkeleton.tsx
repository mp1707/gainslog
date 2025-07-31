import React from 'react';
import { View, Text } from 'react-native';
import { Skeleton } from '../../atoms/Skeleton';
import { useTheme } from '../../../../providers/ThemeProvider';
import { createStyles } from './DescriptionSkeleton.styles';

interface DescriptionSkeletonProps {
  label?: string;
}

export const DescriptionSkeleton: React.FC<DescriptionSkeletonProps> = ({
  label = "Description (Optional)"
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>
      <View style={styles.skeletonContainer}>
        <View style={styles.loadingTextContainer}>
          <Text style={styles.loadingText}>transcribing audio...</Text>
        </View>
        <View style={styles.skeletonLines}>
          <Skeleton height={16} style={styles.skeletonLine} />
          <Skeleton height={16} width="85%" style={styles.skeletonLine} />
          <Skeleton height={16} width="92%" style={styles.skeletonLine} />
          <Skeleton height={16} width="78%" style={styles.skeletonLine} />
        </View>
      </View>
    </View>
  );
};