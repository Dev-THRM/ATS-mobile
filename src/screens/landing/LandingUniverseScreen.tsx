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
  Linking,
  Alert,
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

interface PlatformCardData {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string];
  shadowColor: string;
  description: string;
  capabilities: string[];
  metricsText: string;
  actionText: string;
  actionType: 'internal-ats' | 'external' | 'coming-soon';
  externalUrl?: string;
  footerText?: string;
  footerBoldText?: string;
  footerColor?: string;
}

const ALL_CARDS: PlatformCardData[] = [
  // 1. THRM ATS
  {
    id: 'ats',
    title: 'THRM ATS',
    subtitle: 'Applicant Tracking System',
    badge: 'Talent & Recruitment',
    badgeBg: '#EFF6FF',
    badgeBorder: '#BFDBFE',
    badgeColor: '#1E51DA',
    iconName: 'people',
    gradientColors: ['#1E51DA', '#2563EB'],
    shadowColor: '#1E51DA',
    description:
      'Supercharge your recruitment lifecycle from multi-channel candidate sourcing to AI-assisted resume screening and candidate onboarding.',
    capabilities: [
      'AI Resume Processing & Automated Scoring',
      'Interactive Kanban Pipeline & Multi-Portal Sourcing',
      'Automated Interview Coordination & Evaluator Feedback',
    ],
    metricsText: 'AI-Powered • 4x Faster Hiring',
    actionText: 'Launch ATS Workspace',
    actionType: 'internal-ats',
    footerText: 'New organization?',
    footerBoldText: 'Create ATS workspace',
    footerColor: '#1E51DA',
  },
  // 2. The HR Mindset
  {
    id: 'hrmindset',
    title: 'The HR Mindset',
    subtitle: 'Talent Marketplace & Career Platform',
    badge: 'Job Marketplace',
    badgeBg: '#F0F9FF',
    badgeBorder: '#BAE6FD',
    badgeColor: '#005C82',
    iconName: 'globe-outline',
    gradientColors: ['#006B96', '#004766'],
    shadowColor: '#005C82',
    description:
      'A comprehensive talent and career marketplace connecting employers with top professionals and jobseekers with opportunities across industries.',
    capabilities: [
      'Curated Job Opportunities Across Industries',
      'Direct Employer-to-Talent Matchmaking',
      'Career Growth & Professional Networking',
    ],
    metricsText: 'Work Together • Grow Together',
    actionText: 'Explore HR Mindset',
    actionType: 'external',
    externalUrl: 'https://thehrmindset.org/',
    footerText: 'Explore opportunities on thehrmindset.org',
    footerColor: '#005C82',
  },
  // 3. THRM Digital Marketing
  {
    id: 'digital-marketing',
    title: 'THRM Digital Marketing',
    subtitle: 'Performance Marketing & Brand Growth',
    badge: 'Digital Marketing',
    badgeBg: '#F3F4F6',
    badgeBorder: '#E5E7EB',
    badgeColor: '#374151',
    iconName: 'megaphone-outline',
    gradientColors: ['#4B5563', '#1F2937'],
    shadowColor: '#374151',
    description:
      'Scale your brand with data-driven performance advertising, search engine optimization (SEO), viral social media strategies, and high-converting marketing funnels.',
    capabilities: [
      'High-ROAS Meta & Google Performance Ads',
      'Search Engine Optimization (SEO) & Visibility',
      'Content Marketing & Social Media Strategy',
    ],
    metricsText: 'Data-Driven • Maximize ROI',
    actionText: 'Explore Digital Marketing',
    actionType: 'external',
    externalUrl: 'https://thrmdigitalmarketing.in/',
    footerText: 'Explore services on thrmdigitalmarketing.in',
    footerColor: '#374151',
  },
  // 4. THRM Productions
  {
    id: 'productions',
    title: 'THRM Productions',
    subtitle: 'Cinematic Media & Creative Studios',
    badge: 'Media & Creative',
    badgeBg: '#F4F4F5',
    badgeBorder: '#E4E4E7',
    badgeColor: '#18181B',
    iconName: 'videocam-outline',
    gradientColors: ['#27272A', '#09090B'],
    shadowColor: '#18181B',
    description:
      'End-to-end cinematic media production, commercial ad films, podcast studio broadcasts, brand storytelling, and high-end visual post-production.',
    capabilities: [
      'Cinematic Video Production & Ad Commercials',
      'Brand Storytelling, Podcasts & Studio Shoots',
      'High-End Video Editing & Visual Effects',
    ],
    metricsText: 'Cinematic Vision • High-Impact Media',
    actionText: 'Explore Productions',
    actionType: 'external',
    externalUrl: 'https://thrmproductions.in/',
    footerText: 'Explore productions on thrmproductions.in',
    footerColor: '#18181B',
  },
  // 5. THRM EduTech
  {
    id: 'edutech',
    title: 'THRM EduTech',
    subtitle: 'Digital Marketing & Tech Education',
    badge: 'Skills & Learning',
    badgeBg: '#F5F3FF',
    badgeBorder: '#DDD6FE',
    badgeColor: '#7C3AED',
    iconName: 'school-outline',
    gradientColors: ['#7C3AED', '#6D28D9'],
    shadowColor: '#7C3AED',
    description:
      'Empower learners and teams with hands-on digital marketing, SEO, web development, and performance advertising through real-world agency projects.',
    capabilities: [
      'Practical Project-First Curriculum & Mentorship',
      'Job-Ready Industry Certifications',
      'Live Agency Campaign Management',
    ],
    metricsText: 'Practical Learning • Career Ready',
    actionText: 'Explore EduTech',
    actionType: 'external',
    externalUrl: 'https://thrmedutech.in',
    footerText: 'Explore programs on thrmedutech.in',
    footerColor: '#7C3AED',
  },
  // 6. THRM HRMS
  {
    id: 'hrms',
    title: 'THRM HRMS',
    subtitle: 'Human Resource Management System',
    badge: 'Coming Soon',
    badgeBg: '#F0FDFA',
    badgeBorder: '#99F6E4',
    badgeColor: '#0D9488',
    iconName: 'business-outline',
    gradientColors: ['#0D9488', '#0F766E'],
    shadowColor: '#0D9488',
    description:
      'Unified workforce operations covering employee lifecycle, attendance, payroll records, and statutory compliance.',
    capabilities: [
      'Complete Employee Lifecycle & Profiles',
      'Leave Tracking & Shift Rostering',
      'Enterprise Statutory & Audit Compliance',
    ],
    metricsText: 'Coming Soon • Workforce Governance',
    actionText: 'Coming Soon',
    actionType: 'coming-soon',
    footerText: 'Coming Soon • Platform in development',
    footerColor: '#0D9488',
  },
  // 7. THRM CRM
  {
    id: 'crm',
    title: 'THRM CRM',
    subtitle: 'Customer Relationship Management',
    badge: 'Coming Soon',
    badgeBg: '#F0F9FF',
    badgeBorder: '#BAE6FD',
    badgeColor: '#0284C7',
    iconName: 'trending-up-outline',
    gradientColors: ['#0284C7', '#0369A1'],
    shadowColor: '#0284C7',
    description:
      'Intelligent client pipelines, deal velocity, lead scoring, and automated revenue growth engine.',
    capabilities: [
      'Visual Deal Pipeline & Forecasting',
      'Real-Time Revenue Velocity Tracking',
      'Automated Client Follow-ups & Reminders',
    ],
    metricsText: 'Coming Soon • Pipeline Velocity',
    actionText: 'Coming Soon',
    actionType: 'coming-soon',
    footerText: 'Coming Soon • Platform in development',
    footerColor: '#0284C7',
  },
  // 8. THRM Core Modelling India (CMI)
  {
    id: 'cmi',
    title: 'THRM Core Modelling India (CMI)',
    subtitle: 'Fashion & Creative Talent Agency',
    badge: 'Coming Soon',
    badgeBg: '#FEF2F2',
    badgeBorder: '#FECACA',
    badgeColor: '#DC2626',
    iconName: 'sparkles-outline',
    gradientColors: ['#EF4444', '#B91C1C'],
    shadowColor: '#DC2626',
    description:
      'Premier talent scouting, model management, and casting agency representing top fashion models, runway artists, commercial actors, and brand ambassadors across India.',
    capabilities: [
      'Elite Model Scouting & Portfolio Management',
      'Runway, Fashion Week & Commercial Casting',
      'Nationwide Brand Endorsements & Representation',
    ],
    metricsText: 'Coming Soon • Premier Talent Agency',
    actionText: 'Coming Soon',
    actionType: 'coming-soon',
    footerText: 'Coming Soon • Agency in development',
    footerColor: '#DC2626',
  },
];

export const LandingUniverseScreen: React.FC<LandingUniverseScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const backboneTriggered = useRef(false);

  // Animations
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(30)).current;
  const bottomBarAnim = useRef(new Animated.Value(100)).current;

  // Backbone entrance animation (triggered on scroll)
  const backboneOpacityAnim = useRef(new Animated.Value(0)).current;
  const backboneSlideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(cardsTranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const triggerBackboneAnimation = () => {
    if (backboneTriggered.current) return;
    backboneTriggered.current = true;

    Animated.parallel([
      Animated.timing(backboneOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(backboneSlideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 150) {
      triggerBackboneAnimation();
    }
    if (offsetY > 250) {
      Animated.timing(bottomBarAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(bottomBarAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCardAction = (card: PlatformCardData) => {
    if (card.actionType === 'internal-ats') {
      navigation.navigate('Login', { product: 'ats' });
    } else if (card.actionType === 'external' && card.externalUrl) {
      Linking.openURL(card.externalUrl);
    } else if (card.actionType === 'coming-soon') {
      Alert.alert(
        `${card.title}`,
        `${card.title} is currently under active enterprise development. Stay tuned for official rollout!`
      );
    }
  };

  const handleFooterLink = (card: PlatformCardData) => {
    if (card.actionType === 'internal-ats') {
      navigation.navigate('Register', { product: 'ats' });
    } else if (card.actionType === 'external' && card.externalUrl) {
      Linking.openURL(card.externalUrl);
    }
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

        <TouchableOpacity
          onPress={() => navigation.navigate('Login', { product: 'ats' })}
          style={styles.headerSignInBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.headerSignInText}>Sign In</Text>
          <Ionicons name="arrow-forward" size={13} color={COLORS.primary} />
        </TouchableOpacity>
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
        {/* Subtle Ambient Radial Sky Glow */}
        <LinearGradient
          colors={['#EEF4FF', '#F8FAFC', '#FFFFFF']}
          style={styles.heroBackgroundGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.55 }}
        />

        {/* Hero Section Header */}
        <View style={styles.heroIntroContainer}>
          <View style={styles.heroBadge}>
            <Ionicons name="planet-outline" size={13} color={COLORS.primary} />
            <Text style={styles.heroBadgeText}>ONE UNIVERSE • EIGHT PLATFORMS</Text>
          </View>
          <Text style={styles.heroMainTitle}>
            Powerhouse Platforms &amp; Digital Ventures
          </Text>
          <Text style={styles.heroSubDescription}>
            Explore deeply interconnected ecosystems powering recruitment, talent marketplaces, performance marketing, and enterprise operations.
          </Text>
        </View>

        {/* All 8 Product Cards Container */}
        <Animated.View
          style={[
            styles.cardsContainer,
            {
              opacity: cardOpacityAnim,
              transform: [{ translateY: cardsTranslateY }],
            },
          ]}
        >
          {ALL_CARDS.map((card) => {
            const isComingSoon = card.actionType === 'coming-soon';

            return (
              <View key={card.id} style={styles.productCard}>
                {/* Header Row: Icon & Category Badge */}
                <View style={styles.cardHeaderRow}>
                  <LinearGradient
                    colors={card.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.cardIconBox, { shadowColor: card.shadowColor }]}
                  >
                    <Ionicons name={card.iconName} size={22} color="#FFFFFF" />
                  </LinearGradient>

                  <View
                    style={[
                      styles.categoryBadgePill,
                      { backgroundColor: card.badgeBg, borderColor: card.badgeBorder },
                    ]}
                  >
                    <Text style={[styles.categoryBadgeText, { color: card.badgeColor }]}>
                      {card.badge}
                    </Text>
                  </View>
                </View>

                {/* Title & Subtitle */}
                <View style={styles.titleRow}>
                  <Text style={styles.productTitle}>{card.title}</Text>
                  <Text style={[styles.productSubtitle, { color: card.badgeColor }]}>
                    {card.subtitle}
                  </Text>
                </View>

                {/* Description */}
                <Text style={styles.productDescription}>{card.description}</Text>

                {/* Capabilities Box */}
                <View style={styles.capabilitiesContainer}>
                  <Text style={styles.capabilitiesHeader}>CORE PLATFORM CAPABILITIES</Text>
                  {card.capabilities.map((cap, i) => (
                    <View key={i} style={styles.capabilityRow}>
                      <View
                        style={[
                          styles.checkIconBox,
                          { backgroundColor: card.badgeBg },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-sharp"
                          size={11}
                          color={card.badgeColor}
                        />
                      </View>
                      <Text style={styles.capabilityText}>{cap}</Text>
                    </View>
                  ))}
                </View>

                {/* Metrics Chip */}
                <View
                  style={[
                    styles.metricsChip,
                    { backgroundColor: card.badgeBg, borderColor: card.badgeBorder },
                  ]}
                >
                  <Ionicons name="flash" size={13} color={card.badgeColor} />
                  <Text style={[styles.metricsChipText, { color: card.badgeColor }]}>
                    {card.metricsText}
                  </Text>
                </View>

                {/* Action / Launch Button */}
                {isComingSoon ? (
                  <View style={styles.comingSoonBox}>
                    <Ionicons name="time-outline" size={15} color="#94A3B8" />
                    <Text style={styles.comingSoonText}>Platform in Development</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleCardAction(card)}
                    activeOpacity={0.88}
                    style={[
                      styles.launchButtonTouchable,
                      { shadowColor: card.shadowColor },
                    ]}
                  >
                    <LinearGradient
                      colors={card.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.launchButtonGradient}
                    >
                      <Text style={styles.launchButtonText}>{card.actionText}</Text>
                      <Ionicons
                        name={card.actionType === 'external' ? 'open-outline' : 'arrow-forward'}
                        size={15}
                        color="#FFFFFF"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Secondary Footer / Org Link */}
                {card.footerText && (
                  <TouchableOpacity
                    onPress={() => handleFooterLink(card)}
                    activeOpacity={0.7}
                    style={styles.createOrgLink}
                    disabled={isComingSoon}
                  >
                    <Text style={styles.createOrgText}>
                      {card.footerText}{' '}
                      {card.footerBoldText && (
                        <Text style={[styles.createOrgBold, { color: card.footerColor }]}>
                          {card.footerBoldText}
                        </Text>
                      )}
                    </Text>
                    {!isComingSoon && (
                      <Ionicons
                        name="chevron-forward"
                        size={13}
                        color={card.footerColor || COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </Animated.View>

        {/* SECTION 3: Enterprise Backbone Pillars */}
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
                Automated document parsing, smart candidate scoring, and predictive pipeline analytics.
              </Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Isolated Security</Text>
              <Text style={styles.pillarDesc}>
                Complete row-level tenant isolation, audit logging, and automated cloud backups.
              </Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="phone-portrait" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Mobile Companion</Text>
              <Text style={styles.pillarDesc}>
                Native mobile experience providing candidate screening, interview reviews, and instant updates.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* SECTION 4: Production-Grade Mobile Footer */}
        <View style={styles.footerSection}>
          <Image
            source={require('../../../assets/thrm-universe-logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerDescription}>
            THRM Universe is in alliance with THRM Business Solutions OPC Private Limited.
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
            <Text style={styles.floatingBarSub}>Access your enterprise workspace</Text>
          </View>

          <TouchableOpacity
            style={styles.floatingLaunchBtn}
            onPress={() => navigation.navigate('Login', { product: 'ats' })}
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
    borderBottomColor: '#F1F5F9',
    zIndex: 10,
    ...SHADOWS.sm,
  },
  headerLogo: {
    width: 260,
    height: 80,
  },
  headerSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  headerSignInText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    position: 'relative',
  },
  heroBackgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 420,
  },
  heroIntroContainer: {
    paddingTop: 18,
    paddingBottom: 6,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 8,
  },
  heroBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  heroMainTitle: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  heroSubDescription: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  cardsContainer: {
    gap: 18,
    paddingTop: 8,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 20,
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
    width: 46,
    height: 46,
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
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  titleRow: {
    marginBottom: 8,
  },
  productTitle: {
    fontFamily: FONTS.heading,
    fontSize: 21,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  productSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  productDescription: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18.5,
    marginBottom: 12,
  },
  capabilitiesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 7,
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
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capabilityText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
    lineHeight: 16,
  },
  metricsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 14,
  },
  metricsChipText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
  },
  comingSoonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  comingSoonText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
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
    height: 46,
    paddingHorizontal: 18,
  },
  launchButtonText: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  createOrgLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 4,
  },
  createOrgText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#64748B',
  },
  createOrgBold: {
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
    fontSize: 12,
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
    width: 260,
    height: 80,
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
