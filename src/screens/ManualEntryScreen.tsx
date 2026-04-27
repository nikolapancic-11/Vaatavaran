import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors, spacing, borderRadius, typography, shadows} from '../theme';
import {FormField, ActionButton, ModalPicker, LoadingOverlay} from '../components';
import {bcApi} from '../services/api';
import {
  SustainabilityCategory,
  SustainabilitySubCategory,
  SustainabilityAccount,
  CalculationType,
  DraftEntry,
  EntryStatus,
  PickerOption,
} from '../types';

export default function ManualEntryScreen({route, navigation}: any) {
  const existingDraft = route?.params?.draft as DraftEntry | undefined;
  const viewMode = route?.params?.viewMode || false;

  const [categories, setCategories] = useState<PickerOption[]>([]);
  const [subCategories, setSubCategories] = useState<PickerOption[]>([]);
  const [accounts, setAccounts] = useState<PickerOption[]>([]);
  const [allSubCats, setAllSubCats] = useState<SustainabilitySubCategory[]>([]);
  const [allAccounts, setAllAccounts] = useState<SustainabilityAccount[]>([]);

  const [categoryCode, setCategoryCode] = useState(existingDraft?.categoryCode || '');
  const [subcategoryCode, setSubcategoryCode] = useState(existingDraft?.subcategoryCode || '');
  const [accountNo, setAccountNo] = useState(existingDraft?.accountNo || '');
  const [calculationType, setCalculationType] = useState(existingDraft?.calculationType || CalculationType.FuelElectricity);
  const [quantity, setQuantity] = useState(existingDraft?.quantity?.toString() || '');
  const [description, setDescription] = useState(existingDraft?.description || '');
  const [postingDate, setPostingDate] = useState(existingDraft ? new Date(existingDraft.postingDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showSubCatPicker, setShowSubCatPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCalcPicker, setShowCalcPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([bcApi.getCategories(), bcApi.getSubCategories(), bcApi.getAccounts()])
      .then(([cats, subs, accts]) => {
        setCategories(cats.map(c => ({label: `${c.code} - ${c.description}`, value: c.code})));
        setAllSubCats(subs);
        setAllAccounts(accts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categoryCode) {
      const filtered = allSubCats.filter(s => s.categoryCode === categoryCode);
      setSubCategories(filtered.map(s => ({label: `${s.code} - ${s.description}`, value: s.code})));
    }
  }, [categoryCode, allSubCats]);

  useEffect(() => {
    if (subcategoryCode) {
      const filtered = allAccounts.filter(a => a.subcategoryCode === subcategoryCode);
      setAccounts(filtered.map(a => ({label: `${a.no} - ${a.name}`, value: a.no})));
    }
  }, [subcategoryCode, allAccounts]);

  const calcTypeOptions: PickerOption[] = Object.values(CalculationType).map(ct => ({label: ct, value: ct}));

  const handleSubmit = async () => {
    if (!accountNo || !quantity) {
      Alert.alert('Validation', 'Please fill in account and quantity');
      return;
    }
    setSubmitting(true);
    try {
      await bcApi.createJournalEntry({
        accountNo,
        postingDate: postingDate.toISOString().split('T')[0],
        description,
        quantity: parseFloat(quantity),
        calculationType: calculationType as any,
        categoryCode,
        subcategoryCode,
        stagingBatchId: `MOBILE-${Date.now()}`,
      });
      Alert.alert('Success', 'Entry submitted to Business Central', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch {
      Alert.alert('Error', 'Failed to submit entry. Saving as draft.');
      await saveDraft();
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = async () => {
    const draft: DraftEntry = {
      id: existingDraft?.id || `draft-${Date.now()}`,
      createdAt: existingDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: EntryStatus.Draft,
      accountNo,
      accountName: accounts.find(a => a.value === accountNo)?.label || '',
      categoryCode,
      subcategoryCode,
      calculationType,
      postingDate: postingDate.toISOString().split('T')[0],
      description,
      quantity: parseFloat(quantity) || 0,
      unitOfMeasure: 'kg',
      emissionCO2: 0,
      emissionCH4: 0,
      emissionN2O: 0,
      customAmount: 0,
    };

    const existing = await AsyncStorage.getItem('drafts');
    const drafts: DraftEntry[] = existing ? JSON.parse(existing) : [];
    const idx = drafts.findIndex(d => d.id === draft.id);
    if (idx >= 0) {
      drafts[idx] = draft;
    } else {
      drafts.push(draft);
    }
    await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
    Alert.alert('Saved', 'Draft saved successfully');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LoadingOverlay visible={submitting} message="Submitting..." />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.picker} onPress={() => !viewMode && setShowCatPicker(true)}>
          <Text style={styles.pickerLabel}>Category</Text>
          <Text style={styles.pickerValue}>{categoryCode || 'Select category'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.picker} onPress={() => !viewMode && setShowSubCatPicker(true)}>
          <Text style={styles.pickerLabel}>Subcategory</Text>
          <Text style={styles.pickerValue}>{subcategoryCode || 'Select subcategory'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.picker} onPress={() => !viewMode && setShowAccountPicker(true)}>
          <Text style={styles.pickerLabel}>Account</Text>
          <Text style={styles.pickerValue}>{accountNo || 'Select account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.picker} onPress={() => !viewMode && setShowCalcPicker(true)}>
          <Text style={styles.pickerLabel}>Calculation Type</Text>
          <Text style={styles.pickerValue}>{calculationType}</Text>
        </TouchableOpacity>

        <FormField
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Enter quantity"
          keyboardType="decimal-pad"
          editable={!viewMode}
        />

        <TouchableOpacity style={styles.picker} onPress={() => !viewMode && setShowDatePicker(true)}>
          <Text style={styles.pickerLabel}>Posting Date</Text>
          <Text style={styles.pickerValue}>{postingDate.toISOString().split('T')[0]}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={postingDate}
            mode="date"
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) {setPostingDate(date);}
            }}
          />
        )}

        <FormField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
          numberOfLines={3}
          editable={!viewMode}
        />

        {!viewMode && (
          <View style={styles.buttons}>
            <ActionButton title="Submit to BC" onPress={handleSubmit} style={styles.submitBtn} />
            <ActionButton title="Save as Draft" onPress={saveDraft} variant="outline" style={styles.draftBtn} />
          </View>
        )}
      </ScrollView>

      <ModalPicker visible={showCatPicker} title="Select Category" options={categories} selectedValue={categoryCode} onSelect={setCategoryCode} onClose={() => setShowCatPicker(false)} />
      <ModalPicker visible={showSubCatPicker} title="Select Subcategory" options={subCategories} selectedValue={subcategoryCode} onSelect={setSubcategoryCode} onClose={() => setShowSubCatPicker(false)} />
      <ModalPicker visible={showAccountPicker} title="Select Account" options={accounts} selectedValue={accountNo} onSelect={setAccountNo} onClose={() => setShowAccountPicker(false)} />
      <ModalPicker visible={showCalcPicker} title="Calculation Type" options={calcTypeOptions} selectedValue={calculationType} onSelect={v => setCalculationType(v as CalculationType)} onClose={() => setShowCalcPicker(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1},
  content: {padding: spacing.md, paddingBottom: spacing.xxl},
  picker: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pickerLabel: {...typography.caption, fontWeight: '600', marginBottom: spacing.xs},
  pickerValue: {...typography.body, color: colors.text},
  buttons: {marginTop: spacing.lg, gap: spacing.sm},
  submitBtn: {},
  draftBtn: {},
});
