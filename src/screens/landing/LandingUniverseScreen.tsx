import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

interface LandingUniverseScreenProps {
  navigation: any;
}

export const LandingUniverseScreen: React.FC<LandingUniverseScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleLaunchAts = () => {
    navigation.navigate('Login');
  };

  const handleRegisterAts = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="dark" />

      {/* Sticky Enterprise Header */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 12) + 8 },
        ]}
      >
        <Image
          source={require('../../../assets/thrm-universe-logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Live (99.99%)</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.universeTag}>
            <Ionicons name="planet-outline" size={14} color={COLORS.primary} />
            <Text style={styles.universeTagText}>THRM UNIVERSE ECOSYSTEM</Text>
          </View>

          <Text style={styles.heroTitle}>
            One Universe.{'\n'}
            <Text style={styles.heroHighlight}>Three Powerhouse</Text> Platforms.
          </Text>

          <Text style={styles.heroSubtitle}>
            The unified THRM operational ecosystem powering talent recruitment, revenue growth, and workforce operations.
          </Text>
        </View>

        {/* Product Cards Container */}
        <View style={styles.productsContainer}>
          {/* Card 1: THRM ATS */}
          <View style={[styles.productCard, styles.productCardActive]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconBox}>
                <Ionicons name="people" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.badgeRow}>
                <View style={styles.livePulseDot} />
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>Talent & Recruitment</Text>
                </View>
              </View>
            </View>

            <Text style={styles.productTitle}>THRM ATS</Text>
            <Text style={styles.productSubtitle}>Applicant Tracking System</Text>

            <Text style={styles.productDescription}>
              Supercharge your recruitment lifecycle from multi-channel candidate sourcing to AI-assisted resume screening and candidate onboarding.
            </Text>

            {/* Core Capabilities */}
            <View style={styles.capabilitiesBox}>
              <Text style={styles.capabilitiesHeader}>CORE PLATFORM CAPABILITIES</Text>
              
              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={styles.checkIcon} />
                <Text style={styles.capabilityText}>AI Resume Processing & Automated Scoring</Text>
              </View>

              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={styles.checkIcon} />
                <Text style={styles.capabilityText}>Interactive Kanban Pipeline & Sourcing</Text>
              </View>

              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={styles.checkIcon} />
                <Text style={styles.capabilityText}>Automated Interview Coordination & Evaluator Feedback</Text>
              </View>
            </View>

            {/* Metrics Badge */}
            <View style={styles.metricsBox}>
              <Ionicons name="flash" size={14} color={COLORS.primary} />
              <Text style={styles.metricsText}>AI-Powered • 4x Faster Hiring</Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleLaunchAts}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionText}>Launch ATS Workspace</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionRow}
              onPress={handleRegisterAts}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryActionText}>
                New organization? <Text style={styles.secondaryActionBold}>Create ATS workspace</Text>
              </Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Card 2: THRM CRM */}
          <View style={styles.productCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconBox, { backgroundColor: '#0284C7' }]}>
                <Ionicons name="trending-up" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.badgeRow}>
                <View style={styles.badgePillNeutral}>
                  <Text style={styles.badgePillTextNeutral}>Sales & Revenue</Text>
                </View>
              </View>
            </View>

            <Text style={styles.productTitle}>THRM CRM</Text>
            <Text style={styles.productSubtitle}>Customer Relationship Management</Text>

            <Text style={styles.productDescription}>
              Intelligent client pipelines, deal velocity, lead scoring, and automated revenue growth engine.
            </Text>

            <View style={styles.capabilitiesBox}>
              <Text style={styles.capabilitiesHeader}>CORE PLATFORM CAPABILITIES</Text>
              
              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#0284C7" style={styles.checkIcon} />
                <Text style={styles.capabilityText}>Visual Deal Pipeline & Forecasting</Text>
              </View>

              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#0284C7" style={styles.checkIcon} />
                <Text style={styles.capabilityText}>Real-Time Revenue Velocity Tracking</Text>
              </View>

              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#0284C7" style={styles.checkIcon} />
                <Text style={styles.capabilityText}>Automated Client Follow-ups & Reminders</Text>
              </View>
            </View>

            <View style={styles.metricsBox}>
              <Ionicons name="flash" size={14} color="#0284C7" />
              <Text style={styles.metricsText}>Pipeline Velocity • Deal Tracking</Text>
            </View>

            <View style={styles.companionNotice}>
              <Ionicons name="laptop-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.companionNoticeText}>Web Workspace • Mobile Coming Soon</Text>
            </View>
          </View>

          {/* Card 3: THRM HRMS */}
          <View style={styles.productCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconBox, { backgroundColor: '#0D9488' }]}>
                <Ionicons name="business" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.badgeRow}>
                <View style={styles.badgePillNeutral}>
                  <Text style={styles.badgePillTextNeutral}>People & Operations</Text>
                </View>
              </View>
            </View>

            <Text style={styles.productTitle}>THRM HRMS</Text>
            <Text style={styles.productSubtitle}>Human Resource Management System</Text>

            <Text style={styles.productDescription}>
              Unified workforce operations covering employee lifecycle, attendance, payroll records, and statutory compliance.
            </Text>

            <View style={styles.capabilitiesBox}>
              <Text style={styles.capabilitiesHeader}>CORE PLATFORM CAPABILITIES</Text>
              
              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#0D9488" style={styles.checkIcon} />
                <Text style={styles.capabilityText}>Complete Employee Lifecycle & Profiles</Text>
              </View>

              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#0D9488" style={styles.checkIcon} />
                <Text style={styles.capabilityText}>Leave Tracking & Shift Rostering</Text>
              </View>

              <View style={styles.capabilityItem}>
                <Ionicons name="checkmark-circle" size={16} color="#0D9488" style={styles.checkIcon} />
                <Text style={styles.capabilityText}>Enterprise Statutory & Audit Compliance</Text>
              </View>
            </View>

            <View style={styles.metricsBox}>
              <Ionicons name="flash" size={14} color="#0D9488" />
              <Text style={styles.metricsText}>Employee Lifecycle • Compliance</Text>
            </View>

            <View style={styles.companionNotice}>
              <Ionicons name="laptop-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.companionNoticeText}>Web Workspace • Mobile Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* Enterprise Backbone Pillars */}
        <View style={styles.backboneSection}>
          <Text style={styles.backboneTitle}>Built on a Shared Enterprise Backbone</Text>
          <Text style={styles.backboneSubtitle}>
            Every application in the THRM Universe is deeply interconnected, ensuring zero data silos across operations.
          </Text>

          <View style={styles.pillarsGrid}>
            <View style={styles.pillarItem}>
              <View style={styles.pillarIconBox}>
                <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarHeading}>Universal Identity</Text>
              <Text style={styles.pillarDescription}>
                Centralized authentication with multi-tenant workspaces and granular role permissions.
              </Text>
            </View>

            <View style={styles.pillarItem}>
              <View style={styles.pillarIconBox}>
                <Ionicons name="hardware-chip" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarHeading}>AI Engine Integration</Text>
              <Text style={styles.pillarDescription}>
                Automated document parsing, smart candidate scoring, and predictive pipeline analytics.
              </Text>
            </View>

            <View style={styles.pillarItem}>
              <View style={styles.pillarIconBox}>
                <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarHeading}>Isolated Security</Text>
              <Text style={styles.pillarDescription}>
                Complete tenant isolation, audit logging, and automated encrypted cloud backups.
              </Text>
            </View>

            <View style={styles.pillarItem}>
              <View style={styles.pillarIconBox}>
                <Ionicons name="phone-portrait" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarHeading}>Mobile Companion</Text>
              <Text style={styles.pillarDescription}>
                Native mobile experience with real-time push alerts, interview feedback, and approval actions.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Image
            source={require('../../../assets/thrm-universe-logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} THRM Universe. Enterprise Operations Ecosystem.
          </Text>
          <View style={styles.footerStatusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.footerStatusText}>All Systems Operational (99.99%)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLogo: {
    width: 140,
    height: 40,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroSection: {
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  universeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  universeTagText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.primary,
  },
  heroTitle: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroHighlight: {
    color: COLORS.primary,
  },
  heroSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 340,
  },
  productsContainer: {
    marginTop: 10,
    gap: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.md,
  },
  productCardActive: {
    borderColor: '#BFDBFE',
    ...SHADOWS.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  badgePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgePillText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgePillNeutral: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgePillTextNeutral: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  productSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
    marginBottom: 8,
  },
  productDescription: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  capabilitiesBox: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
    marginBottom: 14,
  },
  capabilitiesHeader: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: '#94A3B8',
    marginBottom: 2,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  checkIcon: {
    marginTop: 1,
  },
  capabilityText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 17,
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  metricsText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 46,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionText: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 4,
  },
  secondaryActionText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#64748B',
  },
  secondaryActionBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  companionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  companionNoticeText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  backboneSection: {
    marginTop: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  backboneTitle: {
    fontFamily: FONTS.heading,
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  backboneSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 18,
  },
  pillarsGrid: {
    gap: 12,
  },
  pillarItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillarIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pillarHeading: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  pillarDescription: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  footerLogo: {
    width: 130,
    height: 36,
    opacity: 0.8,
  },
  footerCopyright: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  footerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  footerStatusText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#10B981',
  },
});
