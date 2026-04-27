import React, {useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {colors} from '../theme';
import {
  RootStackParamList,
  RootTabParamList,
  DashboardStackParamList,
} from '../types';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScopeDetailScreen from '../screens/ScopeDetailScreen';
import UploadScreen from '../screens/UploadScreen';
import ManualEntryScreen from '../screens/ManualEntryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.primary},
        headerTintColor: colors.textInverse,
        headerTitleStyle: {fontWeight: '600'},
      }}>
      <DashboardStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{title: 'Vaatavaran'}}
      />
      <DashboardStack.Screen
        name="ScopeDetail"
        component={ScopeDetailScreen}
        options={({route}) => ({title: route.params.title})}
      />
    </DashboardStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          const icons: Record<string, string> = {
            DashboardTab: 'view-dashboard',
            Upload: 'cloud-upload',
            ManualEntry: 'pencil-plus',
            History: 'history',
            Settings: 'cog',
          };
          return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {fontSize: 11, fontWeight: '500'},
        headerShown: false,
      })}>
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{tabBarLabel: 'Dashboard'}}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarLabel: 'Upload',
          headerShown: true,
          headerTitle: 'Upload Bill',
          headerStyle: {backgroundColor: colors.primary},
          headerTintColor: colors.textInverse,
        }}
      />
      <Tab.Screen
        name="ManualEntry"
        component={ManualEntryScreen}
        options={{
          tabBarLabel: 'New Entry',
          headerShown: true,
          headerTitle: 'Manual Entry',
          headerStyle: {backgroundColor: colors.primary},
          headerTintColor: colors.textInverse,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          headerShown: true,
          headerTitle: 'Entry History',
          headerStyle: {backgroundColor: colors.primary},
          headerTintColor: colors.textInverse,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          headerShown: true,
          headerTitle: 'Settings',
          headerStyle: {backgroundColor: colors.primary},
          headerTintColor: colors.textInverse,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userSession').then(session => {
      setIsLoggedIn(!!session);
    });
  }, []);

  if (isLoggedIn === null) {
    return null; // Loading
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {isLoggedIn ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
