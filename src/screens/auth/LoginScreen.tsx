import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

import { API_BASE_URL, CLOUDFLARE_TUNNEL_URL, setApiBaseUrl } from '../../api/client';
import axios from 'axios';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [orgSlug, setOrgSlug] = useState('thrm-digital-marketing-agency');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentServerUrl, setCurrentServerUrl] = useState<string>(API_BASE_URL);
  const [serverStatus, setServerStatus] = useState<'connected' | 'checking' | 'failed'>('connected');
  const [workspacesList, setWorkspacesList] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  // Forgot password modal state
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSlug, setForgotSlug] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your work email address');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);
    try {
      const res = await authApi.forgotPassword({
        email: forgotEmail.trim(),
        organizationSlug: forgotSlug.trim() || undefined,
      });
      setForgotSuccess(res.message);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to request password reset';
      setForgotError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (overrideSlug?: string) => {
    if (!email.trim() || !password) {
      setError('Please provide your work email and password');
      return;
    }

    const slugToUse = overrideSlug !== undefined ? overrideSlug : orgSlug.trim().toLowerCase();

    setError(null);
    try {
      await login({
        organizationSlug: slugToUse || undefined,
        email: email.trim().toLowerCase(),
        password,
      });
      setWorkspacesList([]);
    } catch (err: any) {
      // If local connection timed out or network error, automatically switch to Cloudflare tunnel and retry!
      const isNetworkIssue =
        err.code === 'ECONNABORTED' ||
        err.message?.includes('timeout') ||
        err.message?.includes('Network Error');

      if (isNetworkIssue && !currentServerUrl.includes('trycloudflare.com')) {
        try {
          const tunnelApi = `${CLOUDFLARE_TUNNEL_URL}/api/v1`;
          setApiBaseUrl(tunnelApi);
          setCurrentServerUrl(tunnelApi);
          await login({
            organizationSlug: slugToUse || undefined,
            email: email.trim().toLowerCase(),
            password,
          });
          setWorkspacesList([]);
          return;
        } catch (retryErr: any) {
          err = retryErr;
        }
      }

      const respData = err.response?.data;
      if (respData?.organizations && Array.isArray(respData.organizations)) {
        setWorkspacesList(respData.organizations);
        setError('Multiple workspaces found for your email. Please select your workspace below:');
      } else {
        const msg =
          respData?.message ||
          (err.message?.includes('Network Error') || err.message?.includes('timeout')
            ? `Connection to server timed out. Tap "Switch to Cloudflare Tunnel" below.`
            : err.message) ||
          'Authentication failed. Please verify credentials.';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    }
  };

  const handleFillThrmAgencyDemo = () => {
    setOrgSlug('thrm-digital-marketing-agency');
    setEmail('bijlanisahil0987@gmail.com');
    setPassword('Password123!');
    setError(null);
  };

  const handleFillThrmCoreDemo = () => {
    setOrgSlug('thrm');
    setEmail('bijlanisahil0987@gmail.com');
    setPassword('Password123!');
    setError(null);
  };

  const handleFillAcmeDemo = () => {
    setOrgSlug('acme-tech');
    setEmail('alex@acme.com');
    setPassword('Password123!');
    setError(null);
  };

  const handleTestConnection = async () => {
    setServerStatus('checking');
    try {
      await axios.get(`${currentServerUrl}/health/liveness`, { timeout: 3500 });
      setServerStatus('connected');
    } catch {
      // Auto-fallback to Cloudflare tunnel if local IP times out or fails
      try {
        const tunnelApi = `${CLOUDFLARE_TUNNEL_URL}/api/v1`;
        await axios.get(`${tunnelApi}/health/liveness`, { timeout: 3500 });
        setApiBaseUrl(tunnelApi);
        setCurrentServerUrl(tunnelApi);
        setServerStatus('connected');
      } catch {
        setServerStatus('failed');
      }
    }
  };

  const handleToggleServer = () => {
    if (currentServerUrl.includes('trycloudflare.com')) {
      const localApi = 'http://192.168.1.35:3000/api/v1';
      setApiBaseUrl(localApi);
      setCurrentServerUrl(localApi);
    } else {
      const tunnelApi = `${CLOUDFLARE_TUNNEL_URL}/api/v1`;
      setApiBaseUrl(tunnelApi);
      setCurrentServerUrl(tunnelApi);
    }
    setServerStatus('connected');
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 47 : 24) + 16,
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>ATS Recruiter</Text>
            <Text style={styles.brandSubtitle}>
              Hiring Pipeline & AI Candidate Screening
            </Text>
          </View>

          {/* Form Card (Light Blue & White Theme) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in to your organization</Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Workspace Selector when multiple workspaces exist for this email */}
            {workspacesList.length > 0 && (
              <View style={styles.workspacePickerContainer}>
                <Text style={styles.workspacePickerTitle}>Select Workspace to Sign In:</Text>
                {workspacesList.map((ws) => (
                  <TouchableOpacity
                    key={ws.slug}
                    style={[
                      styles.workspaceItem,
                      orgSlug === ws.slug && styles.workspaceItemSelected,
                    ]}
                    onPress={() => {
                      setOrgSlug(ws.slug);
                      handleLogin(ws.slug);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="business" size={16} color={COLORS.primary} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.workspaceItemName}>{ws.name}</Text>
                      <Text style={styles.workspaceItemSlug}>slug: {ws.slug}</Text>
                    </View>
                    <Ionicons name="arrow-forward-circle" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Org Slug (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Organization Slug (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={16} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. thrm-digital-marketing-agency"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={orgSlug}
                  onChangeText={setOrgSlug}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Work Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={16} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="recruiter@company.com"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={16}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <View style={styles.forgotRow}>
              <TouchableOpacity
                onPress={() => {
                  setForgotEmail(email);
                  setForgotSlug(orgSlug);
                  setForgotError(null);
                  setForgotSuccess(null);
                  setIsForgotModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={() => handleLogin()}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 5 }} />
                </View>
              )}
            </TouchableOpacity>

            {/* Demo Quick Buttons */}
            <View style={{ marginTop: 14, gap: 8 }}>
              <TouchableOpacity onPress={handleFillThrmAgencyDemo} style={styles.demoButton} activeOpacity={0.7}>
                <Ionicons name="sparkles" size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.demoButtonText}>Auto-Fill THRM Agency (Live Web Data)</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity onPress={handleFillThrmCoreDemo} style={[styles.demoButton, { flex: 1, backgroundColor: COLORS.surfaceSecondary, borderWidth: 1, borderColor: COLORS.borderLight, marginTop: 0 }]} activeOpacity={0.7}>
                  <Ionicons name="business-outline" size={12} color={COLORS.textSecondary} style={{ marginRight: 3 }} />
                  <Text style={[styles.demoButtonText, { color: COLORS.textSecondary, fontSize: 11 }]}>THRM Core</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleFillAcmeDemo} style={[styles.demoButton, { flex: 1, backgroundColor: COLORS.surfaceSecondary, borderWidth: 1, borderColor: COLORS.borderLight, marginTop: 0 }]} activeOpacity={0.7}>
                  <Ionicons name="briefcase-outline" size={12} color={COLORS.textSecondary} style={{ marginRight: 3 }} />
                  <Text style={[styles.demoButtonText, { color: COLORS.textSecondary, fontSize: 11 }]}>Acme Tech</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Server Status Indicator (Tap to Ping / Toggle) */}
            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <TouchableOpacity onPress={handleTestConnection} style={styles.serverInfoRow} activeOpacity={0.7}>
                <View
                  style={[
                    styles.serverDot,
                    {
                      backgroundColor:
                        serverStatus === 'connected'
                          ? '#10B981'
                          : serverStatus === 'checking'
                          ? '#F59E0B'
                          : '#EF4444',
                    },
                  ]}
                />
                <Text style={styles.serverInfoText} numberOfLines={1}>
                  {serverStatus === 'checking'
                    ? 'Testing connection...'
                    : serverStatus === 'failed'
                    ? `Offline (${currentServerUrl.includes('trycloudflare.com') ? 'Cloudflare Tunnel' : 'LAN'}) - Tap to ping`
                    : `Connected: ${currentServerUrl.includes('trycloudflare.com') ? 'Cloudflare Tunnel' : 'LAN Wi-Fi'}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleServer}
                style={{ marginTop: 6, paddingVertical: 4, paddingHorizontal: 8 }}
                activeOpacity={0.6}
              >
                <Text style={{ fontFamily: FONTS.family, fontSize: 11, color: COLORS.primary, textDecorationLine: 'underline' }}>
                  {currentServerUrl.includes('trycloudflare.com')
                    ? 'Switch to Local Wi-Fi (LAN)'
                    : 'Switch to Cloudflare Global Tunnel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Forgot Password Modal */}
        <Modal
          visible={isForgotModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsForgotModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderIcon}>
                  <Ionicons name="key-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <TouchableOpacity
                  onPress={() => setIsForgotModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Enter your work email address to receive password reset instructions.
              </Text>

              {forgotSuccess ? (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  <Text style={styles.successText}>{forgotSuccess}</Text>
                </View>
              ) : null}

              {forgotError ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
                  <Text style={styles.errorText}>{forgotError}</Text>
                </View>
              ) : null}

              {!forgotSuccess ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Work Email</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={16} color={COLORS.textLight} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="you@company.com"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={forgotEmail}
                        onChangeText={setForgotEmail}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Organization Slug (Optional)</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="business-outline" size={16} color={COLORS.textLight} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="acme-corp"
                        placeholderTextColor={COLORS.textLight}
                        autoCapitalize="none"
                        value={forgotSlug}
                        onChangeText={setForgotSlug}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.loginButton, forgotLoading && styles.disabledButton]}
                    onPress={handleForgotPassword}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.loginButtonText}>Send Reset Link</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => setIsForgotModalVisible(false)}
                >
                  <Text style={styles.loginButtonText}>Back to Sign In</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceSecondary, // Soft ice blue #F0F7FF
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  brandTitle: {
    fontFamily: FONTS.family,
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: '400',
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSky,
    ...SHADOWS.md,
  },
  cardTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontFamily: FONTS.family,
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    fontFamily: FONTS.family,
    flex: 1,
    height: 42,
    fontSize: 13.5,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    padding: 6,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 44,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  demoButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
  },
  demoButtonText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.primary,
    fontWeight: '500',
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  forgotText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 22,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.sm,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontFamily: FONTS.family,
    color: COLORS.success,
    fontSize: 12.5,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    lineHeight: 17,
  },
  workspacePickerContainer: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    padding: 12,
    marginBottom: 16,
  },
  workspacePickerTitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 6,
  },
  workspaceItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  workspaceItemName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  workspaceItemSlug: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.primary,
  },
  serverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 6,
  },
  serverDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  serverInfoText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
