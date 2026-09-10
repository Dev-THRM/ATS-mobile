import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RADIUS } from '../theme/theme';

interface StageBadgeProps {
  stageName: string;
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stageName }) => {
  const getStageStyle = (name: string) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('applied') || lower.includes('source') || lower.includes('inbox')) {
      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', dot: '#3B82F6' };
    }
    if (lower.includes('screen')) {
      return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', dot: '#8B5CF6' };
    }
    if (lower.includes('interview') || lower.includes('technical') || lower.includes('managerial')) {
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', dot: '#F59E0B' };
    }
    if (lower.includes('offer')) {
      return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', dot: '#22C55E' };
    }
    if (lower.includes('hired')) {
      return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', dot: '#10B981' };
    }
    if (lower.includes('reject')) {
      return { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', dot: '#EF4444' };
    }
    return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', dot: '#94A3B8' };
  };

  const style = getStageStyle(stageName);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: style.bg, borderColor: style.border },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: style.dot }]} />
      <Text style={[styles.badgeText, { color: style.text }]}>
        {stageName || 'Applied'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
