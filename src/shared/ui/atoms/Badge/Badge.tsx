import React from 'react';
import { View, Text } from 'react-native';
import { ConfidenceBadgeProps } from '../../../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { styles } from './Badge.styles';

export const Badge: React.FC<ConfidenceBadgeProps> = ({ 
  confidence, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <View style={[styles.base, styles.loading]}>
        <LoadingSpinner size="small" />
      </View>
    );
  }

  const getConfidenceInfo = () => {
    if (confidence <= 25) return { style: styles.uncertain, textStyle: styles.uncertainText, label: 'Uncertain' };
    if (confidence <= 50) return { style: styles.partial, textStyle: styles.partialText, label: 'Low Accuracy' };
    if (confidence <= 75) return { style: styles.good, textStyle: styles.goodText, label: 'Medium Accuracy' };
    return { style: styles.high, textStyle: styles.highText, label: 'High Accuracy' };
  };

  const confidenceInfo = getConfidenceInfo();

  return (
    <View style={[styles.base, confidenceInfo.style]}>
      <Text style={[styles.text, confidenceInfo.textStyle]}>
        {confidenceInfo.label}
      </Text>
    </View>
  );
};