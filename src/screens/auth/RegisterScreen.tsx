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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
              paddingBottom: Math.max(insets.bottom, 24) + 24,
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
                <Text style={styles.heroBadgeText}>NEW ATS WORKSPACE</Text>
              </View>
            </View>

            {/* Prominent Astronaut Logo & Pitch */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/thrm-universe-logo-v2.png')}
                style={styles.heroLogo}
                resizeMode="contain"
              />
              <Text style={styles.heroSubtitle}>
                Scale your hiring velocity with AI resume screening &amp; smart pipelines
              </Text>
            </View>
          </LinearGradient>

          {/* Form Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Create your organization workspace</Text>
                <Text style={styles.cardSubtitle}>
                  Set up your hiring portal and team evaluators in under 2 minutes.
                </Text>
              </View>

              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Name Row: First & Last Name */}
              <View style={styles.nameRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>FIRST NAME</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'firstName' && styles.inputWrapperFocused,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={focusedField === 'firstName' ? '#005C82' : '#94A3B8'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Jane"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="words"
                      value={firstName}
                      onChangeText={setFirstName}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>LAST NAME</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === 'lastName' && styles.inputWrapperFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Doe"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="words"
                      value={lastName}
                      onChangeText={setLastName}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              </View>

              {/* Work Email */}
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
                    size={16}
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

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD (MIN 8 CHARACTERS)</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'password' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
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

              {/* Organization Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ORGANIZATION NAME</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'orgName' && styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={16}
                    color={focusedField === 'orgName' ? '#005C82' : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Acme Corporation"
                    placeholderTextColor="#94A3B8"
                    value={orgName}
                    onChangeText={handleOrgNameChange}
                    onFocus={() => setFocusedField('orgName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Organization Slug */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WORKSPACE SLUG (URL IDENTIFIER)</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'orgSlug' && styles.inputWrapperFocused,
                  ]}
                >
                  <Text style={styles.slugPrefix}>thrm.in/</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="acme-corp"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={orgSlug}
                    onChangeText={(val) => {
                      setCustomSlugEdited(true);
                      setOrgSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    }}
                    onFocus={() => setFocusedField('orgSlug')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Sourcing Channels */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CANDIDATE SOURCING CHANNELS</Text>
                <View style={styles.channelsGrid}>
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
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={15}
                          color={isSelected ? '#005C82' : '#94A3B8'}
                          style={{ marginRight: 5 }}
                        />
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
                style={[styles.registerButtonTouchable, isLoading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#005C82', '#004766']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.registerButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.buttonInner}>
                      <Text style={styles.registerButtonText}>Create ATS Workspace</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign In Prompt */}
              <View style={styles.loginPromptRow}>
                <Text style={styles.loginPromptText}>Already have a workspace? </Text>
                <TouchableOpacity
                  onPress={() => navigation?.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLinkText}>Sign in here</Text>
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

  nameRow: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#002D42',
    marginBottom: 6,
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
  slugPrefix: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: '#005C82',
    fontWeight: '700',
    marginRight: 2,
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

  channelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  channelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  channelChipSelected: {
    borderColor: '#005C82',
    backgroundColor: '#E8F3FA',
  },
  channelChipText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  channelChipTextSelected: {
    color: '#005C82',
    fontWeight: '800',
  },

  registerButtonTouchable: {
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
  registerButtonGradient: {
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
  registerButtonText: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.65,
  },

  loginPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  loginPromptText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
  },
  loginLinkText: {
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
});
