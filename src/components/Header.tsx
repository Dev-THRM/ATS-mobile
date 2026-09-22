import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../theme/theme';
import { API_BASE_URL } from '../api/client';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showLogout?: boolean;
  rightAction?: React.ReactNode;
}

const getLogoUri = (url?: string) => {
  if (!url) return null;
  const serverRoot = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const full =
    url.startsWith('http') || url.startsWith('data:')
      ? url
      : `${serverRoot}${url.startsWith('/') ? '' : '/'}${url}`;
  return `${full}${full.includes('?') ? '&' : '?'}v=cropped_v6`;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLogout = false,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'HR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Recruiter';
  const orgName = user?.organization?.name || 'Talent Portal';
  const logoUri = user?.organization?.logoUrl ? getLogoUri(user.organization.logoUrl) : null;

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 47 : 16) + 6;

  return (
    <View style={[styles.wrapper, { paddingTop: topPadding }]}>
      {/* Top Organization Brand & Profile Row */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          {logoUri ? (
            <View style={styles.logoBadgeContainer}>
              <Image
                source={{ uri: logoUri }}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.brandContainer}>
              <View style={styles.fallbackAvatar}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.orgNameBadge} numberOfLines={1}>
                {orgName}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          {rightAction}

          {showLogout && (
            <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={16} color={COLORS.error} />
            </TouchableOpacity>
          )}

          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{getInitials(userName)}</Text>
          </View>
        </View>
      </View>

      {/* Screen Title & Subtitle */}
      <View style={styles.titleRow}>
        <View style={styles.textGroup}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  logoBadgeContainer: {
    height: 38,
    minWidth: 40,
    maxWidth: 180,
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    height: 36,
    width: 150,
  },
  fallbackAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  orgNameBadge: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  userAvatarText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
});
