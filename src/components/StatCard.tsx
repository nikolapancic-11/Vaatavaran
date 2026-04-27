import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, spacing, borderRadius, typography, shadows} from '../theme';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color = colors.primary,
}) => (
  <View style={[styles.card, shadows.card]}>
    <Text style={[styles.icon, {color}]}>{icon}</Text>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  icon: {fontSize: 24, marginBottom: spacing.xs},
  value: {...typography.h2, color: colors.text},
  label: {...typography.caption, textAlign: 'center', marginTop: spacing.xs},
});
