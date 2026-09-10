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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [orgSlug, setOrgSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!orgSlug.trim()) {
      setError('Please enter your Organization Slug');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter both Email and Password');
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
        'Failed to log in. Please check your credentials.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  const handleFillDemo = () => {
    setOrgSlug('acme-corp');
    setEmail('admin@acme.com');
    setPassword('password123');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Banner */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="briefcase" size={32} color="#4F46E5" />
          </View>
          <Text style={styles.brandTitle}>ATS Recruiter</Text>
          <Text style={styles.brandSubtitle}>
            AI-Powered Hiring & Candidate Pipeline
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in to your organization</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Org Slug */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Organization Slug</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. acme-corp"
                placeholderTextColor="#94A3B8"
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
              <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="recruiter@company.com"
                placeholderTextColor="#94A3B8"
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
              <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
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
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </View>
            )}
          </TouchableOpacity>

          {/* Demo Auto-fill Helper */}
          <TouchableOpacity onPress={handleFillDemo} style={styles.demoButton}>
            <Text style={styles.demoButtonText}>Auto-fill Sample Demo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeButton: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  demoButtonText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
});
