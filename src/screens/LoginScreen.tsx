import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {appConfig} from '../config/appConfig';
import {colors, spacing, borderRadius, typography, shadows} from '../theme';
import {FormField, ActionButton} from '../components';

export default function LoginScreen({navigation}: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      // Demo credential check
      if (email === appConfig.demoEmail && password === appConfig.demoPassword) {
        const session = JSON.stringify({
          email,
          name: email.split('@')[0],
          loginTime: new Date().toISOString(),
        });
        await AsyncStorage.setItem('userSession', session);
        navigation.reset({index: 0, routes: [{name: 'Main'}]});
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.logoContainer}>
          <Image
            source={{uri: 'https://alletec.com/wp-content/uploads/2023/03/alletec-logo.png'}}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>{appConfig.appDisplayName}</Text>
          <Text style={styles.subtitle}>Sustainability Emissions Tracker</Text>
        </View>

        <View style={[styles.card, shadows.card]}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ActionButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />
        </View>

        <Text style={styles.demo}>
          Demo: {appConfig.demoEmail} / {appConfig.demoPassword}
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.primary},
  container: {flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, backgroundColor: colors.background},
  logoContainer: {alignItems: 'center', marginBottom: spacing.xl},
  logo: {width: 160, height: 50, marginBottom: spacing.md},
  appName: {...typography.h1, color: colors.primary, marginBottom: spacing.xs},
  subtitle: {...typography.bodySmall, color: colors.textSecondary},
  card: {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg},
  error: {...typography.bodySmall, color: colors.error, marginBottom: spacing.md, textAlign: 'center'},
  button: {marginTop: spacing.sm},
  demo: {...typography.caption, textAlign: 'center', marginTop: spacing.lg},
});
