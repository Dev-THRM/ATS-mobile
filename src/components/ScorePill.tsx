import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ScorePillProps {
  score?: number | null;
  size?: 'small' | 'medium';
}

export const ScorePill: React.FC<ScorePillProps> = ({ score, size = 'small' }) => {
  if (score === undefined || score === null) {
    return (
      <View style={[styles.pill, styles.neutralBg, size === 'medium' && styles.mediumPill]}>
        <Text style={[styles.text, styles.neutralText, size === 'medium' && styles.mediumText]}>
          No ATS Score
        </Text>
      </View>
    );
  }

  const getScoreTheme = (val: number) => {
    if (val >= 80) {
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    }
    if (val >= 50) {
      return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
    }
    return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
  };

  const theme = getScoreTheme(score);

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: theme.bg, borderColor: theme.border },
        size === 'medium' && styles.mediumPill,
      ]}
    >
      <Ionicons name="sparkles" size={size === 'medium' ? 14 : 11} color={theme.text} style={styles.icon} />
      <Text style={[styles.text, { color: theme.text }, size === 'medium' && styles.mediumText]}>
        {Math.round(score)}% Match
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  mediumPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
  mediumText: {
    fontSize: 13,
  },
  neutralBg: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  neutralText: {
    color: '#94A3B8',
  },
});
