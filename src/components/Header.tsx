import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../theme/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showLogout?: boolean;
  rightAction?: React.ReactNode;
}

const getLogoUri = (url?: string) => {
  if (!url) return null;
  const base = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  const full =
    url.startsWith('http') || url.startsWith('data:')
      ? url
      : `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  return `${full}${full.includes('?') ? '&' : '?'}v=fixed3`;
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLogout = false,
  rightAction,
}) => {
  const { user, logout } = useAuth();
  const [aspectRatio, setAspectRatio] = React.useState<number>(2.0);

  const getInitials = (name?: string) => {
    if (!name) return 'HR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Recruiter';
  const orgName = user?.organization?.name || 'Talent Portal';
  const logoUri = user?.organization?.logoUrl ? getLogoUri(user.organization.logoUrl) : null;

  React.useEffect(() => {
    if (logoUri) {
      Image.getSize(
        logoUri,
        (width, height) => {
          if (width > 0 && height > 0) {
            setAspectRatio(width / height);
          }
        },
        () => {}
      );
    }
  }, [logoUri]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          {logoUri ? (
            <Image
              source={{ uri: logoUri }}
              style={[styles.logoImg, { aspectRatio }]}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.fallbackBrand}>
              <View style={styles.orgAvatar}>
                <Ionicons name="sparkles" size={15} color="#FFFFFF" />
              </View>
              <Text style={styles.orgName} numberOfLines={1}>
                {orgName}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          {rightAction}

          {showLogout && (
            <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={17} color={COLORS.error} />
            </TouchableOpacity>
          )}

          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{getInitials(userName)}</Text>
          </View>
        </View>
      </View>

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
    backgroundColor: COLORS.surface,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 12 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  logoImg: {
    height: 25,
    maxHeight: 25,
    maxWidth: 135,
    alignSelf: 'flex-start',
  },
  fallbackBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgAvatar: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  orgInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orgName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  liveText: {
    fontFamily: FONTS.family,
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.success,
    letterSpacing: 0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.borderSky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
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
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '400',
  },
});
