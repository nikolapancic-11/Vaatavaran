import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import {colors, spacing, borderRadius, typography} from '../theme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => (
  <TouchableOpacity
    style={[
      styles.base,
      styles[variant],
      disabled && styles.disabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.7}>
    {loading ? (
      <ActivityIndicator
        color={variant === 'outline' ? colors.primary : colors.textInverse}
        size="small"
      />
    ) : (
      <Text
        style={[
          styles.text,
          variant === 'outline' && styles.textOutline,
          variant === 'secondary' && styles.textSecondary,
        ]}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {backgroundColor: colors.primary},
  secondary: {backgroundColor: colors.primaryLight},
  outline: {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary},
  disabled: {opacity: 0.5},
  text: typography.button,
  textOutline: {color: colors.primary},
  textSecondary: {color: colors.primary},
});
