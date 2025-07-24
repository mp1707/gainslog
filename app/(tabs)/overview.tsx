import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../src/theme';

export default function OverviewTab() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Overview</Text>
      <Text style={styles.subtitle}>
        Coming soon: Your nutrition insights and trends will appear here.
      </Text>
      
      <View style={styles.placeholderCard}>
        <Text style={styles.cardTitle}>Weekly Summary</Text>
        <Text style={styles.cardText}>Track your weekly nutrition goals</Text>
      </View>
      
      <View style={styles.placeholderCard}>
        <Text style={styles.cardTitle}>Monthly Progress</Text>
        <Text style={styles.cardText}>View your monthly nutrition trends</Text>
      </View>
      
      <View style={styles.placeholderCard}>
        <Text style={styles.cardTitle}>Favorite Foods</Text>
        <Text style={styles.cardText}>See your most logged foods</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  placeholderCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});