import React from 'react';
import {View, ActivityIndicator, StyleSheet, Text} from 'react-native';
import {colors, typography, spacing} from '../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
}) => {
  if (!visible) {return null;}
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 150,
  },
  message: {...typography.bodySmall, marginTop: spacing.md, color: colors.textSecondary},
});
