import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components';
import { useTheme } from '@/theme';
import { createStyles } from './MacrosCard.styles';
import { Text } from 'react-native';

interface MacrosCardProps {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  // When true, dim numbers as stale
  processing?: boolean;
  // Changes to this key will trigger slot-machine style counters
  revealKey?: number;
}

// Utility to run a quick slot-machine then count-up animation via state
const useNumberReveal = (initial: number) => {
  const prevRef = useRef(initial);
  const [display, setDisplay] = useState(initial);

  const animateTo = (target: number) => {
    const startPrev = prevRef.current;
    prevRef.current = target;

    // Phase 1: slot-machine (random flicker ~250ms)
    const flickerDuration = 250;
    const flickerStep = 35;
    let elapsed = 0;
    const flicker = setInterval(() => {
      elapsed += flickerStep;
      setDisplay(Math.max(0, Math.round(target * Math.random())));
      if (elapsed >= flickerDuration) {
        clearInterval(flicker);
        // Phase 2: count-up/down to target (~450ms)
        const total = 450;
        const start = Date.now();
        const from = isNaN(startPrev) ? 0 : startPrev;
        const tick = () => {
          const t = Math.min(1, (Date.now() - start) / total);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          const val = Math.round(from + (target - from) * eased);
          setDisplay(val);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, flickerStep);
  };

  return { display, animateTo } as const;
};

export const MacrosCard: React.FC<MacrosCardProps> = ({ calories, protein, carbs, fat, processing = false, revealKey }) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const cals = useNumberReveal(calories ?? 0);
  const prot = useNumberReveal(protein ?? 0);
  const crb = useNumberReveal(carbs ?? 0);
  const ft = useNumberReveal(fat ?? 0);

  // On reveal key changes, animate to target values
  useEffect(() => {
    cals.animateTo(calories ?? 0);
    prot.animateTo(protein ?? 0);
    crb.animateTo(carbs ?? 0);
    ft.animateTo(fat ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealKey]);

  const animatedOpacity = useMemo(() => (processing ? 0.5 : 1), [processing]);

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
        <Text style={{ ...theme.typography.Body, color: colors.secondaryText, opacity: animatedOpacity }}>
          {cals.display} kcal
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.macroRow}>
        <View style={styles.macroLabelContainer}>
          <View style={[styles.macroDot, { backgroundColor: colors.semantic.protein }]} />
          <AppText>Protein</AppText>
        </View>
        <Text style={{ ...theme.typography.Body, color: colors.secondaryText, opacity: animatedOpacity }}>
          {prot.display} g
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.macroRow}>
        <View style={styles.macroLabelContainer}>
          <View style={[styles.macroDot, { backgroundColor: colors.semantic.carbs }]} />
          <AppText>Carbs</AppText>
        </View>
        <Text style={{ ...theme.typography.Body, color: colors.secondaryText, opacity: animatedOpacity }}>
          {crb.display} g
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.macroRow}>
        <View style={styles.macroLabelContainer}>
          <View style={[styles.macroDot, { backgroundColor: colors.semantic.fat }]} />
          <AppText>Fat</AppText>
        </View>
        <Text style={{ ...theme.typography.Body, color: colors.secondaryText, opacity: animatedOpacity }}>
          {ft.display} g
        </Text>
      </View>
    </View>
  );
};
