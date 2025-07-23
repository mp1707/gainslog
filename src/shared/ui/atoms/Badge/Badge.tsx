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

  const getConfidenceStyle = () => {
    if (confidence <= 30) return styles.low;
    if (confidence <= 70) return styles.medium;
    return styles.high;
  };

  const getTextStyle = () => {
    if (confidence <= 30) return styles.lowText;
    if (confidence <= 70) return styles.mediumText;
    return styles.highText;
  };

  return (
    <View style={[styles.base, getConfidenceStyle()]}>
      <Text style={[styles.text, getTextStyle()]}>
        {confidence}%
      </Text>
    </View>
  );
};