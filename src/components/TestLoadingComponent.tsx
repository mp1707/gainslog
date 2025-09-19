import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { MacroLineLoader } from '@/components/refine-page/MacrosCard/MacroLineLoader';

const TestLoadingComponentInner = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const lineWidth = 280;
  const lineHeight = 180;

  const lines = [
    { color: colors.semantic.calories, index: 1 },
    { color: colors.semantic.protein, index: 1 },
    { color: colors.semantic.carbs, index: 1 },
    { color: colors.semantic.fat, index: 1 },
  ];

  return (
    <View style={styles.container}>
      {lines.map((line, idx) => (
        <View key={idx} style={styles.lineContainer}>
          <MacroLineLoader
            color={line.color}
            index={line.index}
            width={lineWidth}
            height={lineHeight}
          />
        </View>
      ))}
    </View>
  );
};

type Colors = ReturnType<typeof useTheme>['colors'];

const createStyles = (colors: Colors) => {
  return StyleSheet.create({
    container: {
      width: 120,
      height: 120,
      // backgroundColor: colors.secondaryBackground,

      padding: 15,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    lineContainer: {
      marginVertical: -65,
    },
  });
};

export const TestLoadingComponent = memo(TestLoadingComponentInner);