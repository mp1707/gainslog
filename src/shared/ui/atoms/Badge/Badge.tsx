import React from 'react';
import { View } from 'react-native';
import { ConfidenceBadgeProps } from '../../../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { AppText } from '../../../../components/AppText';
import { useTheme } from '../../../../providers/ThemeProvider';
import { createStyles } from './Badge.styles';

export const Badge: React.FC<ConfidenceBadgeProps> = ({ 
  confidence, 
  isLoading = false 
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (isLoading) {
    return (
      <View 
        style={[styles.base, styles.loading]}
        accessibilityRole="text"
        accessibilityLabel="Loading confidence indicator"
      >
        <LoadingSpinner size="small" />
      </View>
    );
  }

  const getConfidenceInfo = () => {
    // Updated confidence ranges based on design system
    if (confidence >= 80) return { 
      style: styles.high, 
      textStyle: styles.highText, 
      label: 'High Accuracy',
      range: '80-100%'
    };
    if (confidence >= 60) return { 
      style: styles.good, 
      textStyle: styles.goodText, 
      label: 'Medium Accuracy',
      range: '60-79%'
    };
    if (confidence >= 40) return { 
      style: styles.partial, 
      textStyle: styles.partialText, 
      label: 'Low Accuracy',
      range: '40-59%'
    };
    return { 
      style: styles.uncertain, 
      textStyle: styles.uncertainText, 
      label: 'Uncertain',
      range: '0-39%'
    };
  };

  const confidenceInfo = getConfidenceInfo();

  return (
    <View 
      style={[styles.base, confidenceInfo.style]}
      accessibilityRole="text"
      accessibilityLabel={`AI confidence ${confidenceInfo.label}: ${confidence}%`}
      accessibilityHint={`Confidence range ${confidenceInfo.range}`}
    >
      <AppText role="Caption" style={[styles.text, confidenceInfo.textStyle]}>
        {confidenceInfo.label}
      </AppText>
    </View>
  );
};