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

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const [orgSlug, setOrgSlug] = useState('acme-corp');
  const [email, setEmail] = useState('admin@acme.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleLogin = async () => {
    if (!orgSlug.trim()) {
      setError('Please enter your Organization Slug (e.g. acme-corp)');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please provide your work email and password');
      return;
    }

    setError(null);
    try {
      await login({
        organizationSlug: orgSlug.trim().toLowerCase(),
        email: email.trim(),
        password,
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify credentials.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleFillDemo = () => {
    setOrgSlug('acme-corp');
    setEmail('admin@acme.com');
    setPassword('password123');
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

            {/* Org Slug */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Organization Slug</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={16} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. acme-corp"
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
              onPress={handleLogin}
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

            {/* Demo Quick Button */}
            <TouchableOpacity onPress={handleFillDemo} style={styles.demoButton} activeOpacity={0.7}>
              <Ionicons name="flash-outline" size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.demoButtonText}>Auto-Fill Demo Credentials (Acme Corp)</Text>
            </TouchableOpacity>
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
});
