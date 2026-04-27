import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, SafeAreaView} from 'react-native';
import {colors, spacing, borderRadius, typography, shadows} from '../theme';
import {EmptyState} from '../components';
import {bcApi} from '../services/api';
import {SustainabilityJournalEntry, EmissionScope} from '../types';

export default function ScopeDetailScreen({route}: any) {
  const {scope} = route.params as {scope: EmissionScope; title: string};
  const [entries, setEntries] = useState<SustainabilityJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bcApi
      .getJournalEntries()
      .then(all => {
        setEntries(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [scope]);

  if (!loading && entries.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState icon="📋" title={`No ${scope} entries`} subtitle="Entries for this scope will appear here" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <View style={[styles.card, shadows.card]}>
            <View style={styles.row}>
              <Text style={styles.account}>{item.accountName || item.accountNo}</Text>
              <Text style={styles.co2}>{item.emissionCO2} kg CO₂</Text>
            </View>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.date}>{item.postingDate}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  list: {padding: spacing.md},
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  account: {...typography.body, fontWeight: '600'},
  co2: {...typography.bodySmall, color: colors.success, fontWeight: '600'},
  desc: {...typography.bodySmall, marginTop: spacing.xs},
  date: {...typography.caption, marginTop: spacing.xs},
});
