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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

const SOURCING_CHANNELS = [
  { id: 'LINKEDIN', label: 'LinkedIn' },
  { id: 'NAUKRI', label: 'Naukri' },
  { id: 'GLASSDOOR', label: 'Glassdoor' },
  { id: 'UNSTOP', label: 'Unstop' },
  { id: 'INDEED', label: 'Indeed' },
  { id: 'WELLFOUND', label: 'Wellfound' },
  { id: 'CAREER_PORTAL', label: 'Careers Portal' },
  { id: 'REFERRAL', label: 'Referrals' },
];

export const RegisterScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [customSlugEdited, setCustomSlugEdited] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['LINKEDIN', 'CAREER_PORTAL']);
  const [error, setError] = useState<string | null>(null);

  const handleOrgNameChange = (name: string) => {
    setOrgName(name);
    if (!customSlugEdited) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setOrgSlug(generated);
    }
  };

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((c) => c !== channelId)
        : [...prev, channelId],
    );
  };

  const validate = (): string | null => {
    if (!firstName.trim() || firstName.trim().length < 2) {
      return 'First name must be at least 2 characters.';
    }
    if (!lastName.trim()) {
      return 'Last name is required.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid work email address.';
    }
    if (!password || password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!orgName.trim() || orgName.trim().length < 2) {
      return 'Organization name must be at least 2 characters.';
    }
    if (!orgSlug.trim() || !/^[a-z0-9-]+$/.test(orgSlug.trim())) {
      return 'Organization slug can only contain lowercase letters, numbers, and hyphens.';
    }
    if (selectedChannels.length === 0) {
      return 'Please select at least 1 candidate sourcing channel.';
    }
    return null;
  };

  const handleRegister = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        organizationName: orgName.trim(),
        organizationSlug: orgSlug.trim().toLowerCase(),
        sourcingChannels: selectedChannels,
        plan: 'ATS',
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to register workspace. Please verify details.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
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
              paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 47 : 24) + 16,
              paddingBottom: Math.max(insets.bottom, 24) + 20,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
            {/* Brand Header */}
            <View style={styles.brandContainer}>
              <Image
                source={require('../../../assets/thrm-universe-logo.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create your organization workspace</Text>

              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Name Row */}
              <View style={styles.nameRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={16} color={COLORS.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Jane"
                      placeholderTextColor={COLORS.textLight}
                      autoCapitalize="words"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Doe"
                      placeholderTextColor={COLORS.textLight}
                      autoCapitalize="words"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>
                </View>
              </View>

              {/* Work Email */}
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
                    placeholder="Min. 8 characters"
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

              {/* Organization Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Organization / Company Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="business-outline" size={16} color={COLORS.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Acme Corporation"
                    placeholderTextColor={COLORS.textLight}
                    value={orgName}
                    onChangeText={handleOrgNameChange}
                  />
                </View>
              </View>

              {/* Organization Slug */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Workspace Slug</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="globe-outline" size={16} color={COLORS.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="acme-corporation"
                    placeholderTextColor={COLORS.textLight}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={orgSlug}
                    onChangeText={(txt) => {
                      setCustomSlugEdited(true);
                      setOrgSlug(txt);
                    }}
                  />
                </View>
                <Text style={styles.helperText}>Used for candidate portal subdomain: /{orgSlug || 'your-slug'}</Text>
              </View>

              {/* Candidate Sourcing Channels */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Candidate Sourcing Channels</Text>
                <View style={styles.channelsContainer}>
                  {SOURCING_CHANNELS.map((ch) => {
                    const isSelected = selectedChannels.includes(ch.id);
                    return (
                      <TouchableOpacity
                        key={ch.id}
                        style={[
                          styles.channelChip,
                          isSelected && styles.channelChipSelected,
                        ]}
                        onPress={() => toggleChannel(ch.id)}
                        activeOpacity={0.7}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color="#FFFFFF"
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={[
                            styles.channelChipText,
                            isSelected && styles.channelChipTextSelected,
                          ]}
                        >
                          {ch.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.buttonInner}>
                    <Text style={styles.registerButtonText}>Create Workspace</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Sign In Link */}
              <View style={styles.loginPromptRow}>
                <Text style={styles.loginPromptText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation?.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLinkText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#1E51DA',
  },
  keyboardContainer: {
    flex: 1,
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
  brandLogo: {
    width: 320,
    height: 100,
  },
  card: {
    backgroundColor: '#EEF4FC',
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    ...SHADOWS.lg,
  },
  cardTitle: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
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
  nameRow: {
    flexDirection: 'row',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4E0EE',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    fontFamily: FONTS.input,
    flex: 1,
    height: 42,
    fontSize: 13.5,
    color: '#0F172A',
  },
  eyeButton: {
    padding: 6,
  },
  helperText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  channelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  channelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#D4E0EE',
    backgroundColor: '#FFFFFF',
  },
  channelChipSelected: {
    backgroundColor: '#1E51DA',
    borderColor: '#1E51DA',
  },
  channelChipText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  channelChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#1E51DA',
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
    justifyContent: 'center',
  },
  registerButtonText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loginPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginPromptText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#64748B',
  },
  loginLinkText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E51DA',
  },
});
