import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../theme/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  trend?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  iconName,
  color,
  bgColor,
  trend,
  onPress,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={17} color={color} />
        </View>
        {trend ? (
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={10} color={COLORS.success} />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    width: '48.5%',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: RADIUS.full,
  },
  trendText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '500',
    color: COLORS.success,
    marginLeft: 2,
  },
  content: {
    flex: 1,
  },
  value: {
    fontFamily: FONTS.family,
    fontSize: 21,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  label: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '400',
    marginTop: 3,
  },
});
