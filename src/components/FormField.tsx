import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import {colors, spacing, borderRadius, typography} from '../theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  ...inputProps
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>
      {label}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : null]}
      placeholderTextColor={colors.textLight}
      {...inputProps}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {marginBottom: spacing.md},
  label: {...typography.bodySmall, fontWeight: '600', marginBottom: spacing.xs, color: colors.text},
  required: {color: colors.error},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: {borderColor: colors.error},
  error: {...typography.caption, color: colors.error, marginTop: spacing.xs},
});
