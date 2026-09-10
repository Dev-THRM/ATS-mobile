import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: string | number;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  iconName,
  color,
  bgColor,
}) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flex: 1,
    minWidth: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
});
