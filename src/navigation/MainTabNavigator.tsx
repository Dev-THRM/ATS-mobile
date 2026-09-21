import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { JobsListScreen } from '../screens/jobs/JobsListScreen';
import { JobPipelineScreen } from '../screens/jobs/JobPipelineScreen';
import { CandidatesListScreen } from '../screens/candidates/CandidatesListScreen';
import { CandidateDetailScreen } from '../screens/candidates/CandidateDetailScreen';
import { InterviewsListScreen } from '../screens/interviews/InterviewsListScreen';
import { OrgSettingsScreen } from '../screens/settings/OrgSettingsScreen';
import { COLORS, SHADOWS, FONTS, RADIUS } from '../theme/theme';

const Tab = createBottomTabNavigator();
const JobsStack = createNativeStackNavigator();
const CandidatesStack = createNativeStackNavigator();
const InterviewsStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

const JobsNavigator = () => (
  <JobsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <JobsStack.Screen name="JobsList" component={JobsListScreen} />
    <JobsStack.Screen name="JobPipeline" component={JobPipelineScreen} />
  </JobsStack.Navigator>
);

const CandidatesNavigator = () => (
  <CandidatesStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <CandidatesStack.Screen name="CandidatesList" component={CandidatesListScreen} />
    <CandidatesStack.Screen name="CandidateDetail" component={CandidateDetailScreen} />
  </CandidatesStack.Navigator>
);

const InterviewsNavigator = () => (
  <InterviewsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <InterviewsStack.Screen name="InterviewsList" component={InterviewsListScreen} />
  </InterviewsStack.Navigator>
);

const SettingsNavigator = () => (
  <SettingsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <SettingsStack.Screen name="OrgSettings" component={OrgSettingsScreen} />
  </SettingsStack.Navigator>
);

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 6);
  const barHeight = 54 + (Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          height: barHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          ...SHADOWS.sm,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.family,
          fontSize: 10.5,
          fontWeight: '500',
          marginTop: 1,
          marginBottom: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'apps';

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'JobsTab') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'CandidatesTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'InterviewsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons name={iconName} size={20} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Overview' }}
      />
      <Tab.Screen
        name="JobsTab"
        component={JobsNavigator}
        options={{ tabBarLabel: 'Positions' }}
      />
      <Tab.Screen
        name="CandidatesTab"
        component={CandidatesNavigator}
        options={{ tabBarLabel: 'Candidates' }}
      />
      <Tab.Screen
        name="InterviewsTab"
        component={InterviewsNavigator}
        options={{ tabBarLabel: 'Interviews' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsNavigator}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeIconWrap: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
});
