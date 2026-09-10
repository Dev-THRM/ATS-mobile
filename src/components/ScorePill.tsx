import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS } from '../theme/theme';

interface ScorePillProps {
  score?: number | null;
  size?: 'small' | 'medium';
}

export const ScorePill: React.FC<ScorePillProps> = ({ score, size = 'small' }) => {
  if (score === undefined || score === null) {
    return (
      <View style={[styles.pill, styles.neutralBg, size === 'medium' && styles.mediumPill]}>
        <Ionicons name="sparkles-outline" size={size === 'medium' ? 11 : 9} color={COLORS.textLight} style={styles.icon} />
        <Text style={[styles.text, styles.neutralText, size === 'medium' && styles.mediumText]}>
          Evaluating
        </Text>
      </View>
    );
  }

  const getScoreTheme = (val: number) => {
    if (val >= 80) {
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', icon: 'sparkles' as const };
    }
    if (val >= 60) {
      return { bg: '#F0F9FF', text: '#0284C7', border: '#BAE6FD', icon: 'sparkles' as const };
    }
    if (val >= 40) {
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', icon: 'help-circle-outline' as const };
    }
    return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', icon: 'alert-circle-outline' as const };
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
      <Ionicons
        name={theme.icon}
        size={size === 'medium' ? 12 : 10}
        color={theme.text}
        style={styles.icon}
      />
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
    borderRadius: RADIUS.full,
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
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '500',
  },
  mediumText: {
    fontSize: 11.5,
  },
  neutralBg: {
    backgroundColor: COLORS.surfaceSecondary,
    borderColor: COLORS.border,
  },
  neutralText: {
    color: COLORS.textMuted,
  },
});
