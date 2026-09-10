import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showLogout?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showLogout = false }) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : user?.organization?.name ? (
          <Text style={styles.subtitle}>{user.organization.name}</Text>
        ) : null}
      </View>

      {showLogout && (
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
});
