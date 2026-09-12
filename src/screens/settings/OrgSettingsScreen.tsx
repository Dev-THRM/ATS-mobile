import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

const getLogoUri = (url?: string) => {
  if (!url) return null;
  const base = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  const full =
    url.startsWith('http') || url.startsWith('data:')
      ? url
      : `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  return `${full}${full.includes('?') ? '&' : '?'}v=fixed3`;
};

export const OrgSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const { user, refreshUser, logout } = useAuth();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const { data: orgData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['organization-settings'],
    queryFn: authApi.getOrganization,
  });

  useEffect(() => {
    if (orgData) {
      setName(orgData.name || '');
      setSlug(orgData.slug || '');
      setWebsite(orgData.website || '');
      setLogoUrl(orgData.logoUrl || '');
    }
  }, [orgData]);

  const updateMutation = useMutation({
    mutationFn: authApi.updateOrganization,
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      Alert.alert('Settings Updated', 'Organization details saved successfully.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to update organization settings';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const handlePickLogo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setIsUploadingLogo(true);

        const formData = new FormData();
        if (Platform.OS === 'web' && (file as any).file) {
          formData.append('file', (file as any).file);
        } else {
          formData.append('file', {
            uri: file.uri,
            name: file.name || 'logo.png',
            type: file.mimeType || 'image/png',
          } as any);
        }

        const res = await authApi.uploadOrganizationLogo(formData);
        if (res?.logoUrl) {
          setLogoUrl(res.logoUrl);
          Alert.alert('Logo Uploaded', 'Company logo updated.');
        }
      }
    } catch (err: any) {
      Alert.alert('Upload Error', err.message || 'Could not upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Organization name cannot be empty');
      return;
    }
    if (!slug.trim()) {
      Alert.alert('Validation Error', 'Organization slug cannot be empty');
      return;
    }

    updateMutation.mutate({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      website: website.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
    });
  };

  const handleOpenCareerPortal = () => {
    if (slug) {
      const url = `http://localhost:5173/careers/${slug}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Notice', `Career portal accessible at: /careers/${slug}`);
      });
    }
  };

  if (isLoading && !isRefetching) {
    return <LoadingSpinner message="Loading organization settings..." />;
  }

  const roleName = (user?.role?.name || user?.role?.type || 'Recruiter').replace(/_/g, ' ');
  const counts = orgData?._count || { users: 1, jobs: 0, candidates: 0 };

  return (
    <View style={styles.container}>
      <Header
        title="Settings & Workspace"
        subtitle="Organization & Team Controls"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
      >
        {/* Organization Profile Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Organization Profile</Text>

          {/* Logo & Brand Identity */}
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              {logoUrl ? (
                <Image
                  source={{ uri: getLogoUri(logoUrl) || '' }}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="business" size={26} color={COLORS.primary} />
              )}
            </View>

            <View style={styles.brandMeta}>
              <Text style={styles.brandNameText}>{name || 'Company Name'}</Text>
              <Text style={styles.brandSlugText}>Slug: {slug || 'workspace-slug'}</Text>
            </View>

            <TouchableOpacity
              style={styles.changeLogoBtn}
              onPress={handlePickLogo}
              disabled={isUploadingLogo}
            >
              {isUploadingLogo ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <Text style={styles.changeLogoText}>Change Logo</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Dream11"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Workspace Slug (Subdomain) *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. dream11"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              value={slug}
              onChangeText={setSlug}
            />
            <Text style={styles.inputHelper}>Used for login and public career portal URL</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Official Website URL</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://company.com"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="none"
              value={website}
              onChangeText={setWebsite}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, updateMutation.isPending && styles.disabledBtn]}
            onPress={handleSave}
            disabled={updateMutation.isPending}
            activeOpacity={0.8}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Organization Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Public Career Portal Link */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Public Career Portal</Text>
          <Text style={styles.cardDesc}>
            Candidates can browse open requisitions and submit resumes directly via your public link.
          </Text>

          <TouchableOpacity
            style={styles.careerLinkButton}
            onPress={handleOpenCareerPortal}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
            <Text style={styles.careerLinkText} numberOfLines={1}>
              /careers/{slug || 'company'}
            </Text>
            <Ionicons name="open-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Workspace Stats & Plan Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Workspace Metrics</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNum}>{counts.users}</Text>
              <Text style={styles.metricLabel}>Team Users</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNum}>{counts.jobs}</Text>
              <Text style={styles.metricLabel}>Requisitions</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNum}>{counts.candidates}</Text>
              <Text style={styles.metricLabel}>Talent Pool</Text>
            </View>
          </View>
        </View>

        {/* User Account & Session */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Signed In Recruiter</Text>
          <View style={styles.userInfoRow}>
            <View style={styles.userAvatarBox}>
              <Text style={styles.userAvatarInitial}>
                {user?.firstName?.[0] || 'R'}
              </Text>
            </View>
            <View style={styles.userMetaCol}>
              <Text style={styles.userNameText}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmailText}>{user?.email}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{roleName}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={16} color={COLORS.error} />
            <Text style={styles.logoutButtonText}>Sign Out of Workspace</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  cardDesc: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    padding: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSky,
    marginBottom: 16,
  },
  logoBox: {
    width: 96,
    height: 42,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
    padding: 3,
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  brandMeta: {
    flex: 1,
  },
  brandNameText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  brandSlugText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  changeLogoBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.borderSky,
  },
  changeLogoText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '500',
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalInput: {
    fontFamily: FONTS.family,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  inputHelper: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  careerLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.borderSky,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  careerLinkText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
    marginLeft: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSecondary,
    padding: 12,
    borderRadius: RADIUS.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNum: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metricLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  userAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarInitial: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  userMetaCol: {
    flex: 1,
  },
  userNameText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  userEmailText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  roleTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleTagText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: 6,
  },
});
