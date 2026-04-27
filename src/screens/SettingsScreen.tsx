import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors, spacing, borderRadius, typography, shadows} from '../theme';
import {SectionHeader} from '../components';
import {appConfig} from '../config/appConfig';

export default function SettingsScreen({navigation}: any) {
  const [userEmail, setUserEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('userSession').then(session => {
      if (session) {
        const parsed = JSON.parse(session);
        setUserEmail(parsed.email || '');
      }
    });
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userSession');
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
  };

  const handleClearDrafts = () => {
    Alert.alert('Clear Drafts', 'This will delete all saved drafts. Continue?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('drafts');
          Alert.alert('Done', 'All drafts cleared');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SectionHeader title="Account" />
        <View style={[styles.card, shadows.card]}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>👤</Text>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{userEmail.split('@')[0] || 'User'}</Text>
              <Text style={styles.rowSubtitle}>{userEmail}</Text>
            </View>
          </View>
        </View>

        <SectionHeader title="Preferences" />
        <View style={[styles.card, shadows.card]}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>🔔</Text>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Push Notifications</Text>
              <Text style={styles.rowSubtitle}>Receive submission confirmations</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{false: colors.border, true: colors.primaryLight}}
              thumbColor={notificationsEnabled ? colors.primary : colors.textLight}
            />
          </View>
        </View>

        <SectionHeader title="Data" />
        <View style={[styles.card, shadows.card]}>
          <TouchableOpacity style={styles.row} onPress={handleClearDrafts}>
            <Text style={styles.rowIcon}>🗑️</Text>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, {color: colors.error}]}>Clear All Drafts</Text>
              <Text style={styles.rowSubtitle}>Delete all locally saved drafts</Text>
            </View>
          </TouchableOpacity>
        </View>

        <SectionHeader title="About" />
        <View style={[styles.card, shadows.card]}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>📱</Text>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>{appConfig.appDisplayName}</Text>
              <Text style={styles.rowSubtitle}>Version 1.0.0</Text>
            </View>
          </View>
          <View style={[styles.row, {borderTopWidth: 1, borderTopColor: colors.divider}]}>
            <Text style={styles.rowIcon}>🏢</Text>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Alletec</Text>
              <Text style={styles.rowSubtitle}>alletec.com</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, shadows.card]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.background},
  container: {flex: 1},
  content: {padding: spacing.md, paddingBottom: spacing.xxl},
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  rowIcon: {fontSize: 24, marginRight: spacing.md},
  rowContent: {flex: 1},
  rowTitle: {...typography.body, fontWeight: '600'},
  rowSubtitle: {...typography.caption, marginTop: 2},
  logoutBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {...typography.button, color: colors.error},
});
