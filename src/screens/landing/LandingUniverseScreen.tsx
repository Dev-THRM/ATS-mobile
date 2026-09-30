import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  Easing,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

interface LandingUniverseScreenProps {
  navigation: any;
}

export const LandingUniverseScreen: React.FC<LandingUniverseScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const cardsTriggered = useRef(false);
  const backboneTriggered = useRef(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroSlideAnim = useRef(new Animated.Value(30)).current;
  const statsSlideAnim = useRef(new Animated.Value(40)).current;
  const scrollIndicatorBounce = useRef(new Animated.Value(0)).current;

  // Card entrance animations (triggered on scroll)
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(80)).current;
  const card2Anim = useRef(new Animated.Value(100)).current;
  const card3Anim = useRef(new Animated.Value(120)).current;
  const bottomBarAnim = useRef(new Animated.Value(80)).current;

  // Backbone entrance animation (triggered on scroll)
  const backboneOpacityAnim = useRef(new Animated.Value(0)).current;
  const backboneSlideAnim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    // Entrance for Hero
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(heroSlideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(statsSlideAnim, {
        toValue: 0,
        duration: 700,
        delay: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous Bounce for Scroll Indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollIndicatorBounce, {
          toValue: 6,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scrollIndicatorBounce, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const triggerCardsAnimation = () => {
    if (cardsTriggered.current) return;
    cardsTriggered.current = true;

    Animated.parallel([
      Animated.timing(cardOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(120, [
        Animated.timing(card1Anim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(card2Anim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(card3Anim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(bottomBarAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerBackboneAnimation = () => {
    if (backboneTriggered.current) return;
    backboneTriggered.current = true;

    Animated.parallel([
      Animated.timing(backboneOpacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(backboneSlideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 30) {
      triggerCardsAnimation();
    }
    if (offsetY > 180) {
      triggerBackboneAnimation();
    }
  };

  const scrollToCards = () => {
    triggerCardsAnimation();
    triggerBackboneAnimation();
    scrollViewRef.current?.scrollTo({
      y: height - 160,
      animated: true,
    });
  };

  const handleLaunchProduct = (product: 'ats' | 'crm' | 'hrms') => {
    navigation.navigate('Login', { product });
  };

  const handleRegisterProduct = (product: 'ats' | 'crm' | 'hrms') => {
    navigation.navigate('Register', { product });
  };

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="dark" />

      {/* Sticky Enterprise Header */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 12) + 6 },
        ]}
      >
        <Image
          source={require('../../../assets/thrm-universe-logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Full-Height Initial Hero Viewport (ONLY this is visible on load) */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              minHeight: height - (Platform.OS === 'ios' ? 140 : 120),
              opacity: fadeAnim,
              transform: [{ translateY: heroSlideAnim }],
            },
          ]}
        >
          {/* Subtle Ambient Radial Glow */}
          <LinearGradient
            colors={['rgba(30, 81, 218, 0.1)', 'rgba(239, 246, 255, 0.5)', 'transparent']}
            style={styles.heroGlowBackdrop}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          <View style={styles.heroCenterContent}>
            <Text style={styles.heroTitle}>
              One Universe.{'\n'}
              <Text style={styles.heroHighlight}>Three Powerhouse</Text> Platforms.
            </Text>

            <Text style={styles.heroSubtitle}>
              The unified THRM operational ecosystem powering talent recruitment velocity, intelligent client pipelines, and workforce operations.
            </Text>

            {/* Live Metrics Ribbon */}
            <Animated.View
              style={[
                styles.statsRibbon,
                {
                  transform: [{ translateY: statsSlideAnim }],
                },
              ]}
            >
              <View style={styles.statBox}>
                <Text style={styles.statValue}>4x</Text>
                <Text style={styles.statLabel}>Hiring Speed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>99.99%</Text>
                <Text style={styles.statLabel}>Enterprise SLA</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>3-in-1</Text>
                <Text style={styles.statLabel}>Zero Silos</Text>
              </View>
            </Animated.View>
          </View>

          {/* Animated Scroll Prompt Indicator */}
          <TouchableOpacity
            style={styles.scrollIndicator}
            onPress={scrollToCards}
            activeOpacity={0.7}
          >
            <Text style={styles.scrollIndicatorText}>Scroll to explore platforms</Text>
            <Animated.View style={{ transform: [{ translateY: scrollIndicatorBounce }] }}>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* SECTION 2: Product Cards Container (Equal spacing, animates in on scroll) */}
        <View style={styles.cardsContainer}>
          {/* Card 1: THRM ATS */}
          <Animated.View
            style={[
              styles.productCard,
              {
                opacity: cardOpacityAnim,
                transform: [{ translateY: card1Anim }],
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <LinearGradient
                colors={['#1E51DA', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardIconBox}
              >
                <Ionicons name="people" size={24} color="#FFFFFF" />
              </LinearGradient>

              <View style={styles.categoryBadgePill}>
                <Text style={styles.categoryBadgeText}>Talent & Recruitment</Text>
              </View>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.productTitle}>THRM ATS</Text>
              <Text style={styles.productSubtitle}>Applicant Tracking System</Text>
            </View>

            <Text style={styles.productDescription}>
              Supercharge your recruitment lifecycle from multi-channel candidate sourcing to AI-assisted resume screening and candidate onboarding.
            </Text>

            {/* Core Capabilities */}
            <View style={styles.capabilitiesContainer}>
              <Text style={styles.capabilitiesHeader}>CORE PLATFORM CAPABILITIES</Text>

              <View style={styles.capabilityRow}>
                <View style={styles.checkIconBox}>
                  <Ionicons name="checkmark-sharp" size={12} color={COLORS.primary} />
                </View>
                <Text style={styles.capabilityText}>AI Resume Processing & Automated Scoring</Text>
              </View>

              <View style={styles.capabilityRow}>
                <View style={styles.checkIconBox}>
                  <Ionicons name="checkmark-sharp" size={12} color={COLORS.primary} />
                </View>
                <Text style={styles.capabilityText}>Interactive Kanban Pipeline & Multi-Portal Sourcing</Text>
              </View>

              <View style={styles.capabilityRow}>
                <View style={styles.checkIconBox}>
                  <Ionicons name="checkmark-sharp" size={12} color={COLORS.primary} />
                </View>
                <Text style={styles.capabilityText}>Automated Interview Coordination & Evaluator Feedback</Text>
              </View>
            </View>

            {/* Metrics Chip */}
            <View style={styles.metricsChip}>
              <Ionicons name="flash" size={14} color={COLORS.primary} />
              <Text style={styles.metricsChipText}>AI-Powered • 4x Faster Hiring</Text>
            </View>

            {/* Launch Button */}
            <TouchableOpacity
              onPress={() => handleLaunchProduct('ats')}
              activeOpacity={0.88}
              style={styles.launchButtonTouchable}
            >
              <LinearGradient
                colors={['#1E51DA', '#1746c2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.launchButtonGradient}
              >
                <Text style={styles.launchButtonText}>Launch ATS Workspace</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Create Org Link */}
            <TouchableOpacity
              onPress={() => handleRegisterProduct('ats')}
              activeOpacity={0.7}
              style={styles.createOrgLink}
            >
              <Text style={styles.createOrgText}>
                New organization? <Text style={styles.createOrgBold}>Create ATS workspace</Text>
              </Text>
              <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Card 2: THRM CRM */}
          <Animated.View
            style={[
              styles.productCard,
              {
                opacity: cardOpacityAnim,
                transform: [{ translateY: card2Anim }],
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <LinearGradient
                colors={['#0284C7', '#0369A1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cardIconBox, { shadowColor: '#0284C7' }]}
              >
                <Ionicons name="trending-up" size={24} color="#FFFFFF" />
              </LinearGradient>

              <View style={[styles.categoryBadgePill, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                <Text style={[styles.categoryBadgeText, { color: '#0284C7' }]}>Sales & Revenue</Text>
              </View>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.productTitle}>THRM CRM</Text>
              <Text style={[styles.productSubtitle, { color: '#0284C7' }]}>
                Customer Relationship Management
              </Text>
            </View>

            <Text style={styles.productDescription}>
              Intelligent client pipelines, deal velocity, lead scoring, and automated revenue growth engine.
            </Text>

            <View style={styles.capabilitiesContainer}>
              <Text style={styles.capabilitiesHeader}>CORE PLATFORM CAPABILITIES</Text>

              <View style={styles.capabilityRow}>
                <View style={[styles.checkIconBox, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="checkmark-sharp" size={12} color="#0284C7" />
                </View>
                <Text style={styles.capabilityText}>Visual Deal Pipeline & Forecasting</Text>
              </View>

              <View style={styles.capabilityRow}>
                <View style={[styles.checkIconBox, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="checkmark-sharp" size={12} color="#0284C7" />
                </View>
                <Text style={styles.capabilityText}>Real-Time Revenue Velocity Tracking</Text>
              </View>

              <View style={styles.capabilityRow}>
                <View style={[styles.checkIconBox, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="checkmark-sharp" size={12} color="#0284C7" />
                </View>
                <Text style={styles.capabilityText}>Automated Client Follow-ups & Reminders</Text>
              </View>
            </View>

            <View style={[styles.metricsChip, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
              <Ionicons name="flash" size={14} color="#0284C7" />
              <Text style={[styles.metricsChipText, { color: '#0369A1' }]}>
                Pipeline Velocity • Deal Tracking
              </Text>
            </View>

            {/* Launch Button */}
            <TouchableOpacity
              onPress={() => handleLaunchProduct('crm')}
              activeOpacity={0.88}
              style={[styles.launchButtonTouchable, { shadowColor: '#0284C7' }]}
            >
              <LinearGradient
                colors={['#0284C7', '#0369A1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.launchButtonGradient}
              >
                <Text style={styles.launchButtonText}>Launch CRM Workspace</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRegisterProduct('crm')}
              activeOpacity={0.7}
              style={styles.createOrgLink}
            >
              <Text style={styles.createOrgText}>
                New organization? <Text style={[styles.createOrgBold, { color: '#0284C7' }]}>Create CRM workspace</Text>
              </Text>
              <Ionicons name="chevron-forward" size={13} color="#0284C7" />
            </TouchableOpacity>
          </Animated.View>

          {/* Card 3: THRM HRMS */}
          <Animated.View
            style={[
              styles.productCard,
              {
                opacity: cardOpacityAnim,
                transform: [{ translateY: card3Anim }],
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <LinearGradient
                colors={['#0D9488', '#0F766E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cardIconBox, { shadowColor: '#0D9488' }]}
              >
                <Ionicons name="business" size={24} color="#FFFFFF" />
              </LinearGradient>

              <View style={[styles.categoryBadgePill, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
                <Text style={[styles.categoryBadgeText, { color: '#0D9488' }]}>People & Operations</Text>
              </View>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.productTitle}>THRM HRMS</Text>
              <Text style={[styles.productSubtitle, { color: '#0D9488' }]}>
                Human Resource Management System
              </Text>
            </View>

            <Text style={styles.productDescription}>
              Unified workforce operations covering employee lifecycle, attendance, payroll records, and statutory compliance.
            </Text>

            <View style={styles.capabilitiesContainer}>
              <Text style={styles.capabilitiesHeader}>CORE PLATFORM CAPABILITIES</Text>

              <View style={styles.capabilityRow}>
                <View style={[styles.checkIconBox, { backgroundColor: '#F0FDFA' }]}>
                  <Ionicons name="checkmark-sharp" size={12} color="#0D9488" />
                </View>
                <Text style={styles.capabilityText}>Complete Employee Lifecycle & Profiles</Text>
              </View>

              <View style={styles.capabilityRow}>
                <View style={[styles.checkIconBox, { backgroundColor: '#F0FDFA' }]}>
                  <Ionicons name="checkmark-sharp" size={12} color="#0D9488" />
                </View>
                <Text style={styles.capabilityText}>Leave Tracking & Shift Rostering</Text>
              </View>

              <View style={styles.capabilityRow}>
                <View style={[styles.checkIconBox, { backgroundColor: '#F0FDFA' }]}>
                  <Ionicons name="checkmark-sharp" size={12} color="#0D9488" />
                </View>
                <Text style={styles.capabilityText}>Enterprise Statutory & Audit Compliance</Text>
              </View>
            </View>

            <View style={[styles.metricsChip, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
              <Ionicons name="flash" size={14} color="#0D9488" />
              <Text style={[styles.metricsChipText, { color: '#0F766E' }]}>
                Employee Lifecycle • Compliance
              </Text>
            </View>

            {/* Launch Button */}
            <TouchableOpacity
              onPress={() => handleLaunchProduct('hrms')}
              activeOpacity={0.88}
              style={[styles.launchButtonTouchable, { shadowColor: '#0D9488' }]}
            >
              <LinearGradient
                colors={['#0D9488', '#0F766E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.launchButtonGradient}
              >
                <Text style={styles.launchButtonText}>Launch HRMS Workspace</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRegisterProduct('hrms')}
              activeOpacity={0.7}
              style={styles.createOrgLink}
            >
              <Text style={styles.createOrgText}>
                New organization? <Text style={[styles.createOrgBold, { color: '#0D9488' }]}>Create HRMS workspace</Text>
              </Text>
              <Ionicons name="chevron-forward" size={13} color="#0D9488" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* SECTION 3: Enterprise Backbone Pillars (Equal spacing, animates in on scroll) */}
        <Animated.View
          style={[
            styles.backboneCard,
            {
              opacity: backboneOpacityAnim,
              transform: [{ translateY: backboneSlideAnim }],
            },
          ]}
        >
          <View style={styles.backboneHeader}>
            <Text style={styles.backboneTitle}>Built on a Shared Enterprise Backbone</Text>
            <Text style={styles.backboneSubtitle}>
              Every application in the THRM Universe is deeply interconnected, ensuring zero data silos across operations.
            </Text>
          </View>

          <View style={styles.pillarsGrid}>
            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Universal Identity</Text>
              <Text style={styles.pillarDesc}>
                Centralized authentication with multi-tenant workspace slugs and granular role-based permissions.
              </Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="hardware-chip" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>AI Engine Integration</Text>
              <Text style={styles.pillarDesc}>
                Automated document parsing, smart candidate scoring, and predictive sales pipeline analytics.
              </Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Isolated Security</Text>
              <Text style={styles.pillarDesc}>
                Complete database row-level tenant isolation, audit logging, and automated cloud backups.
              </Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="phone-portrait" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Mobile Companion</Text>
              <Text style={styles.pillarDesc}>
                Native Android mobile app providing real-time push alerts, interview reviews, and approval actions.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* SECTION 4: Production-Grade Mobile Footer (Equal spacing) */}
        <View style={styles.footerSection}>
          <Image
            source={require('../../../assets/thrm-universe-logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerDescription}>
            Unified enterprise operational suite for talent recruitment, client pipelines, and workforce operations.
          </Text>
          <View style={styles.footerDivider} />
          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} THRM Universe. All rights reserved.
          </Text>
          <View style={styles.footerBadgesRow}>
            <Text style={styles.footerBadgeText}>Enterprise Multi-Tenant</Text>
            <Text style={styles.footerBadgeDot}>•</Text>
            <Text style={styles.footerBadgeText}>Encrypted Architecture</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Quick Action Bar */}
      <Animated.View
        style={[
          styles.floatingBottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 12) + 6,
            transform: [{ translateY: bottomBarAnim }],
          },
        ]}
      >
        <View style={styles.floatingBarInner}>
          <View style={styles.floatingBarInfo}>
            <Text style={styles.floatingBarTitle}>THRM Universe</Text>
            <Text style={styles.floatingBarSub}>Access any enterprise workspace</Text>
          </View>

          <TouchableOpacity
            style={styles.floatingLaunchBtn}
            onPress={() => handleLaunchProduct('ats')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#1E51DA', '#1746c2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.floatingLaunchGradient}
            >
              <Text style={styles.floatingLaunchText}>Sign In</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
    ...SHADOWS.sm,
  },
  headerLogo: {
    width: 145,
    height: 42,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroCenterContent: {
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    marginVertical: 'auto',
  },
  heroGlowBackdrop: {
    position: 'absolute',
    top: -20,
    left: -40,
    right: -40,
    height: 260,
    borderRadius: 130,
    opacity: 0.8,
  },
  heroTitle: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 36,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroHighlight: {
    color: COLORS.primary,
  },
  heroSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 340,
  },
  statsRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 20,
    width: '100%',
    ...SHADOWS.sm,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
  },
  scrollIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  scrollIndicatorText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardsContainer: {
    gap: 20,
    marginTop: 36,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryBadgePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  categoryBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  titleRow: {
    marginBottom: 8,
  },
  productTitle: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  productSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  productDescription: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 14,
  },
  capabilitiesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 8,
  },
  capabilitiesHeader: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#94A3B8',
    marginBottom: 2,
  },
  capabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIconBox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capabilityText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
    lineHeight: 16.5,
  },
  metricsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 14,
  },
  metricsChipText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  launchButtonTouchable: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  launchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 18,
  },
  launchButtonText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  createOrgLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 4,
  },
  createOrgText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
  },
  createOrgBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  backboneCard: {
    marginTop: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  backboneHeader: {
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  pillarTile: {
    width: (width - 74) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillarIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pillarTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  pillarDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15.5,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 36,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  footerLogo: {
    width: 145,
    height: 42,
  },
  footerDescription: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 16,
    marginTop: 2,
  },
  footerDivider: {
    width: '60%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  footerCopyright: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  footerBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  footerBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  footerBadgeDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  floatingBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    paddingHorizontal: 16,
    ...SHADOWS.lg,
  },
  floatingBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingBarInfo: {
    flex: 1,
  },
  floatingBarTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  floatingBarSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  floatingLaunchBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  floatingLaunchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  floatingLaunchText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
