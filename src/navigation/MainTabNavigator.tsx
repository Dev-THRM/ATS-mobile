import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { JobsListScreen } from '../screens/jobs/JobsListScreen';
import { JobPipelineScreen } from '../screens/jobs/JobPipelineScreen';
import { CandidatesListScreen } from '../screens/candidates/CandidatesListScreen';
import { CandidateDetailScreen } from '../screens/candidates/CandidateDetailScreen';
import { InterviewsListScreen } from '../screens/interviews/InterviewsListScreen';

const Tab = createBottomTabNavigator();
const JobsStack = createNativeStackNavigator();
const CandidatesStack = createNativeStackNavigator();

const JobsNavigator = () => (
  <JobsStack.Navigator screenOptions={{ headerShown: false }}>
    <JobsStack.Screen name="JobsList" component={JobsListScreen} />
    <JobsStack.Screen name="JobPipeline" component={JobPipelineScreen} />
  </JobsStack.Navigator>
);

const CandidatesNavigator = () => (
  <CandidatesStack.Navigator screenOptions={{ headerShown: false }}>
    <CandidatesStack.Screen name="CandidatesList" component={CandidatesListScreen} />
    <CandidatesStack.Screen name="CandidateDetail" component={CandidateDetailScreen} />
  </CandidatesStack.Navigator>
);

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'apps';

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'JobsTab') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'CandidatesTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'InterviewsTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
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
        component={InterviewsListScreen}
        options={{ tabBarLabel: 'Interviews' }}
      />
    </Tab.Navigator>
  );
};
