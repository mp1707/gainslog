import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, Button } from '@/components';
import { useTheme } from '@/theme';
import { ConfidenceCard } from './ConfidenceCard';

export const TestConfidenceCard: React.FC = () => {
  const { colors, theme } = useTheme();
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTestConfidence = useCallback((value: number) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setConfidenceLevel(value);
      setIsLoading(false);
    }, 2000);
  }, []);

  const styles = StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
    testButton: {
      flex: 1,
      minWidth: 80,
    },
  });

  return (
    <View style={styles.container}>
      <ConfidenceCard 
        value={confidenceLevel} 
        processing={isLoading}
        reveal={!isLoading && confidenceLevel > 0}
      />
      
      <AppText role="Subhead" color="secondary" style={{ textAlign: 'center' }}>
        Test different confidence levels
      </AppText>
      
      <View style={styles.buttonContainer}>
        <Button
          label="20"
          variant="secondary"
          onPress={() => handleTestConfidence(20)}
          disabled={isLoading}
          style={styles.testButton}
        />
        <Button
          label="55"
          variant="secondary"
          onPress={() => handleTestConfidence(55)}
          disabled={isLoading}
          style={styles.testButton}
        />
        <Button
          label="95"
          variant="secondary"
          onPress={() => handleTestConfidence(95)}
          disabled={isLoading}
          style={styles.testButton}
        />
      </View>
    </View>
  );
};