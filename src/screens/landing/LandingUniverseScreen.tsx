import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

const { width } = Dimensions.get('window');

interface LandingUniverseScreenProps {
  navigation: any;
}

type PlatformTab = 'all' | 'ats' | 'crm' | 'hrms';

export const LandingUniverseScreen: React.FC<LandingUniverseScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<PlatformTab>('all');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroSlideAnim = useRef(new Animated.Value(30)).current;
  const statsSlideAnim = useRef(new Animated.Value(40)).current;
  const card1Anim = useRef(new Animated.Value(50)).current;
  const card2Anim = useRef(new Animated.Value(60)).current;
  const card3Anim = useRef(new Animated.Value(70)).current;
  const bottomBarAnim = useRef(new Animated.Value(80)).current;

  // Continuous micro-animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const beaconRippleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Staggered Entrance Animations
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
      Animated.stagger(120, [
        Animated.timing(card1Anim, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(card2Anim, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(card3Anim, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(bottomBarAnim, {
        toValue: 0,
        duration: 700,
        delay: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous Glowing Pulse for Live Status
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 3. Continuous Beacon Ripple
    Animated.loop(
      Animated.sequence([
        Animated.timing(beaconRippleAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(beaconRippleAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 4. Subtle Floating Bob for Hero Tag
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleLaunchAts = () => {
    navigation.navigate('Login');
  };

  const handleRegisterAts = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.screenWrapper}>
      <StatusBar style="dark" />

      {/* Sticky Enterprise Header with Glass Backdrop */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 12) + 6 },
        ]}
      >
        <View style={styles.headerLeft}>
          <Image
            source={require('../../../assets/thrm-universe-logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRight}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDotWrapper}>
              <Animated.View
                style={[
                  styles.statusPulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.25],
                      outputRange: [0.6, 0.15],
                    }),
                  },
                ]}
              />
              <View style={styles.statusDot} />
            </View>
            <Text style={styles.statusText}>99.99% Live</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: heroSlideAnim }],
            },
          ]}
        >
          {/* Subtle Ambient Radial Glow */}
          <LinearGradient
            colors={['rgba(30, 81, 218, 0.12)', 'rgba(239, 246, 255, 0.6)', 'transparent']}
            style={styles.heroGlowBackdrop}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />

          {/* Floating Pill Tag */}
          <Animated.View
            style={[
              styles.universeTagWrapper,
              { transform: [{ translateY: floatAnim }] },
            ]}
          >
            <LinearGradient
              colors={['#EFF6FF', '#DBEAFE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.universeTag}
            >
              <Ionicons name="sparkles" size={13} color={COLORS.primary} />
              <Text style={styles.universeTagText}>UNIFIED ENTERPRISE OPERATIONAL SUITE</Text>
            </LinearGradient>
          </Animated.View>

          <Text style={styles.heroTitle}>
            One Universe.{'\n'}
            <Text style={styles.heroHighlight}>Three Powerhouse</Text> Platforms.
          </Text>

          <Text style={styles.heroSubtitle}>
            Next-generation business infrastructure integrating talent recruitment velocity, intelligent client pipelines, and workforce compliance.
          </Text>
        </Animated.View>

        {/* Live Metrics Ribbon */}
        <Animated.View
          style={[
            styles.statsRibbon,
            {
              opacity: fadeAnim,
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

        {/* Platform Selector Filter Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All Platforms (3)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ats' && styles.tabButtonActive]}
            onPress={() => setActiveTab('ats')}
            activeOpacity={0.7}
          >
            <View style={styles.tabActiveDot} />
            <Text style={[styles.tabText, activeTab === 'ats' && styles.tabTextActive]}>
              ATS • Live
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'crm' && styles.tabButtonActive]}
            onPress={() => setActiveTab('crm')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'crm' && styles.tabTextActive]}>
              CRM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'hrms' && styles.tabButtonActive]}
            onPress={() => setActiveTab('hrms')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'hrms' && styles.tabTextActive]}>
              HRMS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Platform Showcase Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1: THRM ATS (Active & Featured) */}
          {(activeTab === 'all' || activeTab === 'ats') && (
            <Animated.View
              style={[
                styles.featuredCardWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: card1Anim }],
                },
              ]}
            >
              {/* Premium Gradient Outline Glow */}
              <LinearGradient
                colors={['#1E51DA', '#60A5FA', '#BFDBFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradientBorder}
              >
                <View style={styles.cardInner}>
                  {/* Top Status Banner */}
                  <View style={styles.topActiveBanner}>
                    <LinearGradient
                      colors={['#1E51DA', '#1746c2']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.activeBannerGradient}
                    >
                      <View style={styles.activeBeaconRow}>
                        <View style={styles.beaconDot} />
                        <Text style={styles.activeBannerText}>ACTIVE PLATFORM • PRODUCTION READY</Text>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={styles.cardContent}>
                    {/* Header Row */}
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
                        <Ionicons name="sparkles" size={12} color={COLORS.primary} />
                        <Text style={styles.categoryBadgeText}>Talent & Sourcing</Text>
                      </View>
                    </View>

                    {/* Titles */}
                    <View style={styles.titleRow}>
                      <Text style={styles.productTitle}>THRM ATS</Text>
                      <Text style={styles.productSubtitle}>Applicant Tracking System</Text>
                    </View>

                    <Text style={styles.productDescription}>
                      Autonomous AI resume parsing, candidate scoring, interactive Kanban pipeline stages, and end-to-end interview intelligence.
                    </Text>

                    {/* Interactive Capabilities Grid */}
                    <View style={styles.capabilitiesContainer}>
                      <Text style={styles.capabilitiesHeader}>CORE PLATFORM CAPABILITIES</Text>

                      <View style={styles.capabilityRow}>
                        <View style={styles.checkIconBox}>
                          <Ionicons name="checkmark-sharp" size={12} color={COLORS.primary} />
                        </View>
                        <Text style={styles.capabilityText}>AI Resume Parsing & Automated Scoring (0-100)</Text>
                      </View>

                      <View style={styles.capabilityRow}>
                        <View style={styles.checkIconBox}>
                          <Ionicons name="checkmark-sharp" size={12} color={COLORS.primary} />
                        </View>
                        <Text style={styles.capabilityText}>Drag-and-Drop Pipeline & Multi-Portal Sourcing</Text>
                      </View>

                      <View style={styles.capabilityRow}>
                        <View style={styles.checkIconBox}>
                          <Ionicons name="checkmark-sharp" size={12} color={COLORS.primary} />
                        </View>
                        <Text style={styles.capabilityText}>Integrated Interview Scheduling & Scorecards</Text>
                      </View>
                    </View>

                    {/* Metrics Chip */}
                    <View style={styles.metricsChip}>
                      <Ionicons name="flash" size={14} color={COLORS.primary} />
                      <Text style={styles.metricsChipText}>AI-Powered • 4x Faster Hiring Velocity</Text>
                    </View>

                    {/* Main CTA Button */}
                    <TouchableOpacity
                      onPress={handleLaunchAts}
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
                        <View style={styles.launchButtonIconBox}>
                          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Secondary Link */}
                    <TouchableOpacity
                      onPress={handleRegisterAts}
                      activeOpacity={0.7}
                      style={styles.createOrgLink}
                    >
                      <Text style={styles.createOrgText}>
                        New organization? <Text style={styles.createOrgBold}>Create ATS workspace</Text>
                      </Text>
                      <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Card 2: THRM CRM */}
          {(activeTab === 'all' || activeTab === 'crm') && (
            <Animated.View
              style={[
                styles.standardCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: card2Anim }],
                },
              ]}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <LinearGradient
                    colors={['#0284C7', '#0369A1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardIconBox}
                  >
                    <Ionicons name="trending-up" size={24} color="#FFFFFF" />
                  </LinearGradient>

                  <View style={[styles.categoryBadgePill, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                    <Text style={[styles.categoryBadgeText, { color: '#0284C7' }]}>Sales & Velocity</Text>
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
                    <Text style={styles.capabilityText}>Visual Deal Pipeline & Revenue Forecasting</Text>
                  </View>

                  <View style={styles.capabilityRow}>
                    <View style={[styles.checkIconBox, { backgroundColor: '#F0F9FF' }]}>
                      <Ionicons name="checkmark-sharp" size={12} color="#0284C7" />
                    </View>
                    <Text style={styles.capabilityText}>Real-Time Client Velocity & Deal Health</Text>
                  </View>
                </View>

                <View style={[styles.metricsChip, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                  <Ionicons name="speedometer-outline" size={14} color="#0284C7" />
                  <Text style={[styles.metricsChipText, { color: '#0369A1' }]}>
                    Pipeline Velocity • Deal Tracking
                  </Text>
                </View>

                <View style={styles.companionRibbon}>
                  <Ionicons name="globe-outline" size={15} color="#64748B" />
                  <Text style={styles.companionRibbonText}>Web Active • Mobile Companion In Progress</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Card 3: THRM HRMS */}
          {(activeTab === 'all' || activeTab === 'hrms') && (
            <Animated.View
              style={[
                styles.standardCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: card3Anim }],
                },
              ]}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <LinearGradient
                    colors={['#0D9488', '#0F766E']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardIconBox}
                  >
                    <Ionicons name="business" size={24} color="#FFFFFF" />
                  </LinearGradient>

                  <View style={[styles.categoryBadgePill, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
                    <Text style={[styles.categoryBadgeText, { color: '#0D9488' }]}>People & Ops</Text>
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
                    <Text style={styles.capabilityText}>Complete Employee Lifecycle & Records</Text>
                  </View>

                  <View style={styles.capabilityRow}>
                    <View style={[styles.checkIconBox, { backgroundColor: '#F0FDFA' }]}>
                      <Ionicons name="checkmark-sharp" size={12} color="#0D9488" />
                    </View>
                    <Text style={styles.capabilityText}>Leave Tracking & Shift Rostering</Text>
                  </View>
                </View>

                <View style={[styles.metricsChip, { backgroundColor: '#F0FDFA', borderColor: '#99F6E4' }]}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#0D9488" />
                  <Text style={[styles.metricsChipText, { color: '#0F766E' }]}>
                    Employee Lifecycle • Compliance
                  </Text>
                </View>

                <View style={styles.companionRibbon}>
                  <Ionicons name="globe-outline" size={15} color="#64748B" />
                  <Text style={styles.companionRibbonText}>Web Active • Mobile Companion In Progress</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Enterprise Backbone Pillars (2x2 Grid) */}
        <View style={styles.backboneCard}>
          <View style={styles.backboneHeader}>
            <Text style={styles.backboneTitle}>Built on a Shared Enterprise Backbone</Text>
            <Text style={styles.backboneSubtitle}>
              Deeply unified architecture eliminating data fragmentation across talent, revenue, and workforce ops.
            </Text>
          </View>

          <View style={styles.pillarsGrid}>
            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="lock-closed" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Universal Identity</Text>
              <Text style={styles.pillarDesc}>Multi-tenant workspace slugs with granular RBAC permissions.</Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="hardware-chip" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>AI Intelligence</Text>
              <Text style={styles.pillarDesc}>Deep resume semantics, fit scoring, and smart pipeline summaries.</Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Isolated Security</Text>
              <Text style={styles.pillarDesc}>Tenant row-level security, audit trails, and automatic encrypted backups.</Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="phone-portrait" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Mobile Native</Text>
              <Text style={styles.pillarDesc}>Real-time push notifications, candidate reviews, and quick approvals.</Text>
            </View>
          </View>
        </View>

        {/* Enterprise Trust Ribbon */}
        <View style={styles.trustRibbon}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
          <Text style={styles.trustText}>
            Enterprise Grade • Zero Data Silos • End-to-End Encryption
          </Text>
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
            <Text style={styles.floatingBarTitle}>THRM ATS Mobile</Text>
            <Text style={styles.floatingBarSub}>Ready to access your workspace?</Text>
          </View>

          <TouchableOpacity
            style={styles.floatingLaunchBtn}
            onPress={handleLaunchAts}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
    ...SHADOWS.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 135,
    height: 38,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: RADIUS.full,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusDotWrapper: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  statusPulseRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#065F46',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroSection: {
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 14,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlowBackdrop: {
    position: 'absolute',
    top: -20,
    left: -40,
    right: -40,
    height: 220,
    borderRadius: 110,
    opacity: 0.8,
  },
  universeTagWrapper: {
    marginBottom: 12,
  },
  universeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  universeTagText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: COLORS.primary,
  },
  heroTitle: {
    fontFamily: FONTS.heading,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 34,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  heroHighlight: {
    color: COLORS.primary,
  },
  heroSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18.5,
    maxWidth: 330,
  },
  statsRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 6,
    marginBottom: 18,
    ...SHADOWS.sm,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: 16,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  tabActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  tabText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  cardsContainer: {
    gap: 16,
  },
  featuredCardWrapper: {
    borderRadius: RADIUS.xl + 2,
    ...SHADOWS.lg,
  },
  cardGradientBorder: {
    padding: 1.5,
    borderRadius: RADIUS.xl + 2,
  },
  cardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  topActiveBanner: {
    width: '100%',
  },
  activeBannerGradient: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  activeBeaconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  beaconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  activeBannerText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  standardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardContent: {
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardIconBox: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18.5,
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
    fontSize: 9.5,
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
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
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
    shadowColor: COLORS.primary,
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
  launchButtonIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 11.5,
    color: '#64748B',
  },
  createOrgBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  companionRibbon: {
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
  companionRibbonText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  backboneCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 18,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  backboneSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16.5,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pillarTile: {
    width: (width - 64 - 10) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillarIconCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pillarTitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  pillarDesc: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14.5,
  },
  trustRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 8,
  },
  trustText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  footerLogo: {
    width: 120,
    height: 32,
    opacity: 0.8,
  },
  footerCopyright: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'center',
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
