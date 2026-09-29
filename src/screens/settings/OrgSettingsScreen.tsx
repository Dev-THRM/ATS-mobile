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
import { TeamSettingsTab } from './TeamSettingsTab';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';
import { getServerRoot } from '../../api/client';

const getLogoUri = (url?: string) => {
  if (!url) return null;
  const serverRoot = getServerRoot();
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

  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'security'>('profile');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password cannot be identical to current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your password has been changed successfully.');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      setPasswordError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const { data: members = [] } = useQuery({
    queryKey: ['organization-members'],
    queryFn: authApi.getOrganizationMembers,
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
      const serverRoot = getServerRoot();
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

      {/* Tabs Switcher */}
      <View style={styles.topTabBar}>
        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'profile' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="business-outline"
            size={15}
            color={activeTab === 'profile' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.topTabText,
              activeTab === 'profile' && styles.topTabTextActive,
            ]}
          >
            Company Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'team' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('team')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="people-outline"
            size={15}
            color={activeTab === 'team' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.topTabText,
              activeTab === 'team' && styles.topTabTextActive,
            ]}
          >
            Team Access
          </Text>
          {members.length > 0 && (
            <View style={styles.topTabBadge}>
              <Text style={styles.topTabBadgeText}>{members.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'security' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('security')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color={activeTab === 'security' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.topTabText,
              activeTab === 'security' && styles.topTabTextActive,
            ]}
          >
            Security
          </Text>
        </TouchableOpacity>
      </View>

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
        {activeTab === 'team' ? (
          <TeamSettingsTab />
        ) : activeTab === 'security' ? (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconBadge}>
                <Ionicons name="key-outline" size={17} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Account Security</Text>
                <Text style={styles.sectionSubtitle}>
                  Update your account password
                </Text>
              </View>
            </View>

            {passwordSuccess ? (
              <View style={styles.successBannerBox}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                <Text style={styles.successBannerText}>{passwordSuccess}</Text>
              </View>
            ) : null}

            {passwordError ? (
              <View style={styles.errorBannerBox}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                <Text style={styles.errorBannerText}>{passwordError}</Text>
              </View>
            ) : null}

            <View style={styles.formContainer}>
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password *</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter current password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showCurrent}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrent(!showCurrent)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password (min 6 chars) *</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew(!showNew)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showNew ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password *</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, isChangingPassword && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={isChangingPassword}
                activeOpacity={0.8}
              >
                {isChangingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>Update Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
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
          </>
        )}
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
    width: 110,
    height: 75,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 6,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 23,
    letterSpacing: -0.3,
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
    fontFamily: FONTS.input,
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
  topTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  topTabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  topTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  topTabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  topTabBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  topTabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 10,
  },
  eyeBtn: {
    padding: 6,
  },
  successBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
  },
  errorBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
    flex: 1,
  },
});
