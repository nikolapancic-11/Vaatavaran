import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors, spacing, borderRadius, typography, shadows} from '../theme';
import {EmptyState, ActionButton} from '../components';
import {bcApi} from '../services/api';
import {
  SustainabilityJournalEntry,
  DraftEntry,
  EntryStatus,
  FilterState,
} from '../types';

type BCHistoryItem = SustainabilityJournalEntry & {source: 'bc'};
type DraftHistoryItem = DraftEntry & {source: 'draft'};
type HistoryItem = BCHistoryItem | DraftHistoryItem;

export default function HistoryScreen({navigation}: any) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [filters, setFilters] = useState<FilterState>({searchQuery: ''});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bcEntries, draftsJson] = await Promise.all([
        bcApi.getJournalEntries().catch(() => []),
        AsyncStorage.getItem('drafts'),
      ]);

      const drafts: DraftEntry[] = draftsJson ? JSON.parse(draftsJson) : [];
      const allItems: HistoryItem[] = [
        ...drafts.map(d => ({...d, source: 'draft' as const})),
        ...bcEntries.map(e => ({...e, source: 'bc' as const})),
      ];

      allItems.sort((a, b) => {
        const dateA = a.postingDate || (a.source === 'draft' ? a.createdAt : '');
        const dateB = b.postingDate || (b.source === 'draft' ? b.createdAt : '');
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setItems(allItems);
    } catch {
      // Handle error silently for demo
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = items.filter(item => {
    const query = filters.searchQuery.toLowerCase();
    if (!query) {return true;}
    const desc = item.description.toLowerCase();
    const account = (item.accountName || item.accountNo || '').toLowerCase();
    return desc.includes(query) || account.includes(query);
  });

  const handleDelete = async (item: HistoryItem) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (item.source === 'draft') {
            const draftsJson = await AsyncStorage.getItem('drafts');
            const drafts: DraftEntry[] = draftsJson ? JSON.parse(draftsJson) : [];
            const updated = drafts.filter(d => d.id !== item.id);
            await AsyncStorage.setItem('drafts', JSON.stringify(updated));
          } else {
            try {
              await bcApi.deleteJournalEntry(item.id);
            } catch {
              Alert.alert('Error', 'Failed to delete BC entry');
              return;
            }
          }
          loadData();
          setSelectedItem(null);
        },
      },
    ]);
  };

  const renderItem = ({item}: {item: HistoryItem}) => (
    <TouchableOpacity
      style={[styles.card, shadows.card]}
      onPress={() => setSelectedItem(item)}
      activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, item.source === 'draft' ? styles.badgeDraft : styles.badgeBc]}>
          <Text style={styles.badgeText}>{item.source === 'draft' ? 'Draft' : 'Submitted'}</Text>
        </View>
        <Text style={styles.date}>{item.postingDate}</Text>
      </View>
      <Text style={styles.account}>
        {item.accountName || item.accountNo}
      </Text>
      <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
        {'emissionCO2' in item && (
          <Text style={styles.emission}>{item.emissionCO2} kg CO₂</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries..."
          placeholderTextColor={colors.textLight}
          value={filters.searchQuery}
          onChangeText={q => setFilters(f => ({...f, searchQuery: q}))}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[colors.primary]} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState icon="📋" title="No entries found" subtitle="Create a new entry or adjust your search" />
          ) : null
        }
      />

      <Modal visible={!!selectedItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, shadows.elevated]}>
            {selectedItem && (
              <>
                <Text style={styles.modalTitle}>Entry Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>{selectedItem.source === 'draft' ? 'Draft' : 'Submitted'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{selectedItem.postingDate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account</Text>
                  <Text style={styles.detailValue}>{selectedItem.accountName || selectedItem.accountNo}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{selectedItem.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailValue}>{selectedItem.quantity}</Text>
                </View>
                <View style={styles.modalButtons}>
                  <ActionButton title="Close" onPress={() => setSelectedItem(null)} variant="outline" style={{flex: 1}} />
                  <ActionButton title="Delete" onPress={() => handleDelete(selectedItem)} variant="primary" style={{flex: 1, backgroundColor: colors.error}} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  searchBar: {padding: spacing.md, backgroundColor: colors.surface},
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  list: {padding: spacing.md, paddingBottom: spacing.xxl},
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs},
  badge: {paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm},
  badgeDraft: {backgroundColor: colors.warning + '20'},
  badgeBc: {backgroundColor: colors.success + '20'},
  badgeText: {...typography.caption, fontWeight: '600'},
  date: typography.caption,
  account: {...typography.body, fontWeight: '600'},
  desc: {...typography.bodySmall, marginTop: spacing.xs},
  cardFooter: {flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm},
  quantity: typography.caption,
  emission: {...typography.caption, color: colors.success, fontWeight: '600'},
  modalOverlay: {flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg},
  modalContent: {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg},
  modalTitle: {...typography.h2, marginBottom: spacing.md},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  detailLabel: {...typography.bodySmall, color: colors.textSecondary},
  detailValue: {...typography.body, fontWeight: '500', flex: 1, textAlign: 'right'},
  modalButtons: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg},
});
