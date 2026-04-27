import React from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {colors, spacing, borderRadius, typography, shadows} from '../theme';
import {PickerOption} from '../types';

interface ModalPickerProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const ModalPicker: React.FC<ModalPickerProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.overlay}>
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Done</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={item => item.value}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.option,
                item.value === selectedValue && styles.optionSelected,
              ]}
              onPress={() => {
                onSelect(item.value);
                onClose();
              }}>
              <Text
                style={[
                  styles.optionText,
                  item.value === selectedValue && styles.optionTextSelected,
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end'},
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: typography.h3,
  close: {...typography.body, color: colors.primary, fontWeight: '600'},
  option: {paddingHorizontal: spacing.lg, paddingVertical: spacing.md},
  optionSelected: {backgroundColor: colors.primaryLight},
  optionText: typography.body,
  optionTextSelected: {color: colors.primary, fontWeight: '600'},
  separator: {height: 1, backgroundColor: colors.divider},
});
