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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth.api';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

import { API_BASE_URL, PROD_API_URL, LOCAL_LAN_URL, setApiBaseUrl } from '../../api/client';
import { useKeyboardShift } from '../../hooks/useKeyboardShift';

export const LoginScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [orgSlug, setOrgSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'slug' | null>(null);
  const [currentServerUrl, setCurrentServerUrl] = useState<string>(API_BASE_URL);
  const [workspacesList, setWorkspacesList] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  // Forgot password modal state
  const { keyboardHeight: forgotKbHeight, onInputFocus: forgotInputFocus } = useKeyboardShift();
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
      const isNetworkIssue =
        err.code === 'ECONNABORTED' ||
        err.message?.includes('timeout') ||
        err.message?.includes('Network Error');

      if (isNetworkIssue) {
        const alternateUrl = currentServerUrl.includes('api.thrmuniverse.in')
          ? LOCAL_LAN_URL
          : PROD_API_URL;
        try {
          setApiBaseUrl(alternateUrl);
          setCurrentServerUrl(alternateUrl);
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
            ? `Connection timed out. Switched to backup server, please tap Sign In again.`
            : err.message) ||
          'Authentication failed. Please verify credentials.';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom, 24) + 20,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top London Blue Hero Header */}
          <LinearGradient
            colors={['#004766', '#005C82', '#006B96']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.heroHeader,
              {
                paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16) + 12,
              },
            ]}
          >
            {/* Top Navigation Row */}
            <View style={styles.heroNavRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Landing')}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={16} color="#BAE6FD" />
                <Text style={styles.backButtonText}>THRM Universe</Text>
              </TouchableOpacity>

              <View style={styles.heroBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.heroBadgeText}>ATS WORKSPACE</Text>
              </View>
            </View>

            {/* Prominent Astronaut Logo & Hero Pitch */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/thrm-universe-logo-v2.png')}
                style={styles.heroLogo}
                resizeMode="contain"
              />
              <Text style={styles.heroSubtitle}>
                Unified Enterprise Recruitment &amp; Operational Platform
              </Text>
            </View>
          </LinearGradient>

          {/* Form Card Area */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Sign in to your organization</Text>
                <Text style={styles.cardSubtitle}>
                  Enter your credentials to access your candidate pipeline.
                </Text>
              </View>

              {/* Error Alert */}
              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Workspace Selector when multiple workspaces exist for email */}
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
                      <View style={styles.workspaceItemIcon}>
                        <Ionicons name="business" size={16} color="#005C82" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.workspaceItemName}>{ws.name}</Text>
                        <Text style={styles.workspaceItemSlug}>slug: {ws.slug}</Text>
                      </View>
                      <Ionicons name="arrow-forward-circle" size={20} color="#005C82" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Work Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WORK EMAIL</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'email' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={17}
                    color={focusedField === 'email' ? '#005C82' : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="recruiter@company.com"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.inputLabel}>PASSWORD</Text>
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
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'password' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={17}
                    color={focusedField === 'password' ? '#005C82' : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#005C82"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Organization Slug (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ORGANIZATION SLUG (OPTIONAL)</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'slug' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={17}
                    color={focusedField === 'slug' ? '#005C82' : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. thrm-digital-marketing-agency"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={orgSlug}
                    onChangeText={setOrgSlug}
                    onFocus={() => setFocusedField('slug')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* London Blue Sign In Button */}
              <TouchableOpacity
                style={[styles.loginButtonTouchable, isLoading && styles.disabledButton]}
                onPress={() => handleLogin()}
                disabled={isLoading}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#005C82', '#004766']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.buttonInner}>
                      <Text style={styles.loginButtonText}>Sign In to Workspace</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Register Prompt */}
              <View style={styles.registerPromptRow}>
                <Text style={styles.registerPromptText}>Don't have a workspace? </Text>
                <TouchableOpacity
                  onPress={() => navigation?.navigate('Register')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerLinkText}>Register here</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Security Assurance */}
            <View style={styles.securityBadgeRow}>
              <Ionicons name="shield-checkmark" size={14} color="#005C82" />
              <Text style={styles.securityBadgeText}>
                Enterprise Multi-Tenant Isolated &amp; End-to-End Encrypted
              </Text>
            </View>
          </View>

          {/* Forgot Password Modal */}
          <Modal
            visible={isForgotModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsForgotModalVisible(false)}
            statusBarTranslucent
          >
            <View style={[styles.modalOverlay, { paddingBottom: forgotKbHeight }]}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setIsForgotModalVisible(false)}
              />
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderIcon}>
                    <Ionicons name="key-outline" size={20} color="#005C82" />
                  </View>
                  <Text style={styles.modalTitle}>Reset Workspace Password</Text>
                  <Text style={styles.modalSub}>
                    Enter your work email address and we'll send you an encrypted password reset link.
                  </Text>
                </View>

                {forgotSuccess ? (
                  <View style={styles.modalSuccessBanner}>
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                    <Text style={styles.modalSuccessText}>{forgotSuccess}</Text>
                  </View>
                ) : null}

                {forgotError ? (
                  <View style={styles.modalErrorBanner}>
                    <Ionicons name="alert-circle" size={18} color="#DC2626" />
                    <Text style={styles.modalErrorText}>{forgotError}</Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>WORK EMAIL</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={16} color="#005C82" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="recruiter@company.com"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      onFocus={forgotInputFocus}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>WORKSPACE SLUG (OPTIONAL)</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="business-outline" size={16} color="#005C82" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. thrm-digital-marketing-agency"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      value={forgotSlug}
                      onChangeText={setForgotSlug}
                      onFocus={forgotInputFocus}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalSubmitButton, forgotLoading && styles.disabledButton]}
                  onPress={handleForgotPassword}
                  disabled={forgotLoading}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#005C82', '#004766']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalSubmitGradient}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalSubmitText}>Send Reset Link</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setIsForgotModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#F4F9FD',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* London Blue Hero Header */
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#004766',
  },
  heroNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  backButtonText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#E0F2FE',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  heroBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  heroLogo: {
    width: 220,
    height: 62,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#BAE6FD',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  /* Card Container */
  cardContainer: {
    marginTop: -16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 92, 130, 0.16)',
    ...Platform.select({
      ios: {
        shadowColor: '#005C82',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    fontWeight: '900',
    color: '#002D42',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: FONTS.family,
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },

  workspacePickerContainer: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 16,
  },
  workspacePickerTitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#005C82',
    marginBottom: 8,
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  workspaceItemSelected: {
    borderColor: '#005C82',
    backgroundColor: '#E8F3FA',
  },
  workspaceItemIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
    backgroundColor: '#E8F3FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceItemName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#002D42',
  },
  workspaceItemSlug: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#005C82',
    marginTop: 1,
  },

  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#002D42',
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  forgotText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#005C82',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: '#005C82',
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    fontFamily: FONTS.input,
    flex: 1,
    height: 46,
    fontSize: 13.5,
    color: '#002D42',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },

  loginButtonTouchable: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#005C82',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginButtonGradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.65,
  },

  registerPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  registerPromptText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
  },
  registerLinkText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#005C82',
  },

  securityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 8,
  },
  securityBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#005C82',
    textAlign: 'center',
  },

  /* Forgot Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 45, 66, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 92, 130, 0.2)',
    ...SHADOWS.lg,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F3FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: FONTS.heading,
    fontSize: 17,
    fontWeight: '800',
    color: '#002D42',
    marginBottom: 4,
  },
  modalSub: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  modalSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 12,
  },
  modalSuccessText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#059669',
    fontWeight: '600',
    flex: 1,
  },
  modalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 12,
  },
  modalErrorText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  modalSubmitButton: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginTop: 6,
  },
  modalSubmitGradient: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  modalCancelText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
