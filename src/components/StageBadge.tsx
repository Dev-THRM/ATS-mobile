import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StageBadgeProps {
  stageName: string;
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stageName }) => {
  const getStageStyle = (name: string) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('applied')) {
      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    }
    if (lower.includes('screen')) {
      return { bg: '#FDF4FF', text: '#9333EA', border: '#F5D0FE' };
    }
    if (lower.includes('interview')) {
      return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
    }
    if (lower.includes('offer')) {
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    }
    if (lower.includes('hired')) {
      return { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC' };
    }
    if (lower.includes('reject')) {
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    }
    return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  };

  const style = getStageStyle(stageName);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: style.bg, borderColor: style.border },
      ]}
    >
      <Text style={[styles.badgeText, { color: style.text }]}>
        {stageName || 'Applied'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
});
