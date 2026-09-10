import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { View, StyleSheet } from 'react-native';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <LoadingSpinner message="Starting ATS Recruiter..." />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
