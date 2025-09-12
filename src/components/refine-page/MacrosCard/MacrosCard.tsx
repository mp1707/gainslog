import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components';
import { useTheme } from '@/theme';
import { createStyles } from './MacrosCard.styles';

interface MacrosCardProps {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
}

export const MacrosCard: React.FC<MacrosCardProps> = ({ calories, protein, carbs, fat }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <View style={styles.card}>
      <AppText role="Caption" style={styles.sectionHeader}>
        MACROS
      </AppText>
      <View style={styles.macroRow}>
        <View style={styles.macroLabelContainer}>
          <View style={[styles.macroDot, { backgroundColor: colors.semantic.calories }]} />
          <AppText>Calories</AppText>
        </View>
        <AppText color="secondary">{calories ?? 0} kcal</AppText>
      </View>
      <View style={styles.divider} />
      <View style={styles.macroRow}>
        <View style={styles.macroLabelContainer}>
          <View style={[styles.macroDot, { backgroundColor: colors.semantic.protein }]} />
          <AppText>Protein</AppText>
        </View>
        <AppText color="secondary">{protein ?? 0} g</AppText>
      </View>
      <View style={styles.divider} />
      <View style={styles.macroRow}>
        <View style={styles.macroLabelContainer}>
          <View style={[styles.macroDot, { backgroundColor: colors.semantic.carbs }]} />
          <AppText>Carbs</AppText>
        </View>
        <AppText color="secondary">{carbs ?? 0} g</AppText>
      </View>
      <View style={styles.divider} />
      <View style={styles.macroRow}>
        <View style={styles.macroLabelContainer}>
          <View style={[styles.macroDot, { backgroundColor: colors.semantic.fat }]} />
          <AppText>Fat</AppText>
        </View>
        <AppText color="secondary">{fat ?? 0} g</AppText>
      </View>
    </View>
  );
};

