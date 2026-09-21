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
import { API_BASE_URL } from '../../api/client';

const getLogoUri = (url?: string) => {
  if (!url) return null;
  const serverRoot = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const full =
    url.startsWith('http') || url.startsWith('data:')
      ? url
      : `${serverRoot}${url.startsWith('/') ? '' : '/'}${url}`;
  return `${full}${full.includes('?') ? '&' : '?'}v=cropped_v6`;
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
      const msg =
        err.response?.data?.message || err.message || 'Failed to update organization settings';
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
      const serverRoot = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
      const host = serverRoot.replace(/:3000$/, ':5173');
      const url = `${host}/careers/${slug}`;
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
  const currentLogoUri = logoUrl ? getLogoUri(logoUrl) : null;

  return (
    <View style={styles.container}>
      <Header title="Settings & Workspace" subtitle="Organization & Team Controls" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* 1. Organization Identity Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBadge}>
              <Ionicons name="business" size={17} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Organization Identity</Text>
              <Text style={styles.sectionSubtitle}>
                Brand logo, company name and workspace subdomain
              </Text>
            </View>
          </View>

          {/* Logo Showcase & Company Header */}
          <View style={styles.brandHeroCard}>
            <View style={styles.brandHeroTopRow}>
              <View style={styles.logoContainer}>
                {currentLogoUri ? (
                  <Image
                    source={{ uri: currentLogoUri }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.fallbackLogoBox}>
                    <Ionicons name="business" size={28} color="#2563EB" />
                  </View>
                )}
              </View>

              <View style={styles.brandHeroMeta}>
                <Text style={styles.brandHeroName} numberOfLines={2}>
                  {name || 'Company Name'}
                </Text>
                <View style={styles.subdomainTag}>
                  <Ionicons name="link-outline" size={12} color="#0369A1" />
                  <Text style={styles.subdomainText} numberOfLines={1}>
                    {slug ? `${slug}.ats.io` : 'workspace-slug'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Logo Upload Button */}
            <View style={styles.brandHeroBottomRow}>
              <TouchableOpacity
                style={styles.uploadLogoBtn}
                onPress={handlePickLogo}
                disabled={isUploadingLogo}
                activeOpacity={0.7}
              >
                {isUploadingLogo ? (
                  <ActivityIndicator color="#2563EB" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={15} color="#2563EB" />
                    <Text style={styles.uploadLogoText}>Change Company Logo</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.uploadHintText}>PNG, JPG or SVG (Max 5MB)</Text>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            {/* Company Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Company Legal Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="business-outline"
                  size={17}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. THRM Digital Marketing Agency"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Workspace Slug Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Workspace Subdomain Slug <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="globe-outline"
                  size={17}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. thrm-digital-marketing"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={slug}
                  onChangeText={setSlug}
                />
              </View>
              <View style={styles.helperRow}>
                <Ionicons name="information-circle-outline" size={13} color="#64748B" />
                <Text style={styles.helperText}>
                  Unique subdomain used for recruiter login and public careers portal.
                </Text>
              </View>
            </View>

            {/* Official Website URL Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Official Website URL</Text>
              <View style={styles.inputBox}>
                <Ionicons
                  name="link-outline"
                  size={17}
                  color="#64748B"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="https://company.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={website}
                  onChangeText={setWebsite}
                />
              </View>
            </View>

            {/* Save Changes Button */}
            <TouchableOpacity
              style={[styles.saveBtn, updateMutation.isPending && styles.disabledBtn]}
              onPress={handleSave}
              disabled={updateMutation.isPending}
              activeOpacity={0.85}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Organization Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Public Career Portal Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="compass-outline" size={17} color="#059669" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Public Career Portal</Text>
              <Text style={styles.sectionSubtitle}>
                Candidates can browse jobs & apply directly online
              </Text>
            </View>
          </View>

          <View style={styles.careerPortalBox}>
            <View style={styles.careerPortalLeft}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live Portal</Text>
              </View>
              <Text style={styles.careerUrlText} numberOfLines={1}>
                /careers/{slug || 'company'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.openPortalBtn}
              onPress={handleOpenCareerPortal}
              activeOpacity={0.7}
            >
              <Text style={styles.openPortalBtnText}>View Site</Text>
              <Ionicons name="open-outline" size={13} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Workspace Usage Metrics */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="bar-chart-outline" size={17} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Workspace Metrics</Text>
              <Text style={styles.sectionSubtitle}>Active pipeline and talent pool volume</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={[styles.metricTile, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Ionicons name="people-outline" size={20} color="#2563EB" />
              <Text style={[styles.metricNumber, { color: '#1E40AF' }]}>{counts.users}</Text>
              <Text style={styles.metricLabel}>Team Users</Text>
            </View>

            <View style={[styles.metricTile, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
              <Ionicons name="briefcase-outline" size={20} color="#7C3AED" />
              <Text style={[styles.metricNumber, { color: '#5B21B6' }]}>{counts.jobs}</Text>
              <Text style={styles.metricLabel}>Requisitions</Text>
            </View>

            <View style={[styles.metricTile, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Ionicons name="id-card-outline" size={20} color="#059669" />
              <Text style={[styles.metricNumber, { color: '#065F46' }]}>{counts.candidates}</Text>
              <Text style={styles.metricLabel}>Talent Pool</Text>
            </View>
          </View>
        </View>

        {/* 4. Signed In Recruiter Account */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="person-circle-outline" size={18} color="#475569" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Recruiter Account</Text>
              <Text style={styles.sectionSubtitle}>Current logged in session</Text>
            </View>
          </View>

          <View style={styles.userProfileCard}>
            <View style={styles.userAvatarBig}>
              <Text style={styles.userAvatarBigText}>
                {user?.firstName?.[0] || 'R'}
                {user?.lastName?.[0] || ''}
              </Text>
            </View>
            <View style={styles.userProfileMeta}>
              <Text style={styles.userNameBig}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.userEmailText}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{roleName.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={17} color="#DC2626" />
            <Text style={styles.signOutBtnText}>Sign Out of Workspace</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  brandHeroCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  brandHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  fallbackLogoBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandHeroMeta: {
    flex: 1,
  },
  brandHeroName: {
    fontFamily: FONTS.family,
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  subdomainTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  subdomainText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
  },
  brandHeroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 12,
  },
  uploadLogoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  uploadLogoText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  uploadHintText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#94A3B8',
  },
  formContainer: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  requiredStar: {
    color: '#EF4444',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    height: '100%',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  helperText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    height: 46,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  careerPortalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  careerPortalLeft: {
    flex: 1,
    marginRight: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  careerUrlText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  openPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  openPortalBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricTile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  metricNumber: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
  },
  metricLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  userAvatarBig: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarBigText: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userProfileMeta: {
    flex: 1,
  },
  userNameBig: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmailText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  roleBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    height: 42,
    borderRadius: 10,
  },
  signOutBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});
