import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors, spacing, borderRadius, typography, shadows} from '../theme';
import {StatCard, SectionHeader, EmptyState, ActionButton} from '../components';
import {bcApi} from '../services/api';
import {DashboardStats, EmissionScope, DraftEntry} from '../types';

export default function DashboardScreen({navigation}: any) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    thisMonthEntries: 0,
    totalEmissionsCO2: 0,
    draftCount: 0,
    scope1Emissions: 0,
    scope2Emissions: 0,
    scope3Emissions: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [entries, draftsJson] = await Promise.all([
        bcApi.getJournalEntries().catch(() => []),
        AsyncStorage.getItem('drafts'),
      ]);

      const drafts: DraftEntry[] = draftsJson ? JSON.parse(draftsJson) : [];
      const now = new Date();
      const thisMonth = entries.filter(e => {
        const d = new Date(e.postingDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const totalCO2 = entries.reduce((sum, e) => sum + (e.emissionCO2 || 0), 0);

      setStats({
        totalEntries: entries.length,
        thisMonthEntries: thisMonth.length,
        totalEmissionsCO2: Math.round(totalCO2 * 100) / 100,
        draftCount: drafts.length,
        scope1Emissions: 0,
        scope2Emissions: 0,
        scope3Emissions: 0,
      });
    } catch {
      // Silently handle errors for demo
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const scopeCards = [
    {scope: EmissionScope.Scope1, label: 'Scope 1', desc: 'Direct Emissions', color: colors.scope1, icon: '🏭'},
    {scope: EmissionScope.Scope2, label: 'Scope 2', desc: 'Electricity / Heat', color: colors.scope2, icon: '⚡'},
    {scope: EmissionScope.Scope3, label: 'Scope 3', desc: 'Indirect / Value Chain', color: colors.scope3, icon: '🚛'},
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[colors.primary]} />}
        contentContainerStyle={styles.content}>

        <SectionHeader title="Overview" />
        <View style={styles.statsRow}>
          <StatCard icon="📊" value={stats.totalEntries} label="Total Entries" />
          <StatCard icon="📅" value={stats.thisMonthEntries} label="This Month" />
          <StatCard icon="🌿" value={stats.totalEmissionsCO2} label="CO₂e (kg)" color={colors.success} />
          <StatCard icon="📝" value={stats.draftCount} label="Drafts" color={colors.warning} />
        </View>

        <SectionHeader title="Emission Scopes" />
        {scopeCards.map(card => (
          <TouchableOpacity
            key={card.scope}
            style={[styles.scopeCard, shadows.card]}
            onPress={() => navigation.navigate('ScopeDetail', {scope: card.scope, title: card.label})}
            activeOpacity={0.7}>
            <Text style={styles.scopeIcon}>{card.icon}</Text>
            <View style={styles.scopeInfo}>
              <Text style={styles.scopeLabel}>{card.label}</Text>
              <Text style={styles.scopeDesc}>{card.desc}</Text>
            </View>
            <Text style={[styles.scopeArrow, {color: card.color}]}>›</Text>
          </TouchableOpacity>
        ))}

        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          <ActionButton
            title="📝 New Entry"
            onPress={() => navigation.getParent()?.navigate('ManualEntry')}
            style={styles.actionBtn}
          />
          <ActionButton
            title="📤 Upload Bill"
            onPress={() => navigation.getParent()?.navigate('Upload')}
            variant="outline"
            style={styles.actionBtn}
          />
        </View>

        {stats.totalEntries === 0 && !loading && (
          <EmptyState
            icon="🌱"
            title="No entries yet"
            subtitle="Start tracking your emissions by creating a new entry or uploading a bill"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1},
  content: {padding: spacing.md, paddingBottom: spacing.xxl},
  statsRow: {flexDirection: 'row', marginBottom: spacing.md},
  scopeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  scopeIcon: {fontSize: 28, marginRight: spacing.md},
  scopeInfo: {flex: 1},
  scopeLabel: {...typography.h3},
  scopeDesc: {...typography.bodySmall},
  scopeArrow: {fontSize: 32, fontWeight: '300'},
  actionsRow: {flexDirection: 'row', gap: spacing.sm},
  actionBtn: {flex: 1},
});
