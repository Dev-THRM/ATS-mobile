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
  footerType: 'auth' | 'external' | 'coming-soon';
  footerText?: string;
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
    gradientColors: ['#1E51DA', '#1D4ED8'],
    shadowColor: '#1E51DA',
    description:
      'Supercharge your recruitment lifecycle from multi-channel candidate sourcing to AI-assisted resume screening and candidate onboarding.',
    capabilities: [
      'AI Resume Processing & Automated Scoring',
      'Interactive Kanban Pipeline & Multi-Portal Sourcing',
      'Automated Interview Coordination & Evaluator Feedback',
    ],
    metricsText: 'AI-Powered • 4x Faster Hiring',
    actionText: 'Explore ATS',
    actionType: 'internal-ats',
    footerType: 'auth',
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
    footerType: 'external',
    footerText: 'Explore opportunities on thehrmindset.org',
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
    footerType: 'external',
    footerText: 'Explore services on thrmdigitalmarketing.in',
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
    footerType: 'external',
    footerText: 'Explore productions on thrmproductions.in',
  },
  // 5. THRM EduTech
  {
    id: 'edutech',
    title: 'THRM EduTech',
    subtitle: 'Skills & Learning',
    badge: 'Skills & Learning',
    badgeBg: '#FAF5FF',
    badgeBorder: '#E9D5FF',
    badgeColor: '#7C3AED',
    iconName: 'school-outline',
    gradientColors: ['#7C3AED', '#6D28D9'],
    shadowColor: '#7C3AED',
    description:
      'Industry-aligned training programs, career roadmaps, and real-world certification in modern software, cloud engineering, and digital skills.',
    capabilities: [
      'Hands-on Enterprise Curriculum & Live Labs',
      'Industry Mentorship & Capstone Projects',
      'Placement Preparation & Career Mentorship',
    ],
    metricsText: 'Practical Learning • Career Ready',
    actionText: 'Explore EduTech',
    actionType: 'external',
    externalUrl: 'https://thrmedutech.in',
    footerType: 'external',
    footerText: 'Explore courses & programs on thrmedutech.in',
  },
  // 6. THRM HRMS
  {
    id: 'hrms',
    title: 'THRM HRMS',
    subtitle: 'Human Resource Management System',
    badge: 'Coming Soon',
    badgeBg: '#F0FDFA',
    badgeBorder: '#CCFBF1',
    badgeColor: '#0D9488',
    iconName: 'business-outline',
    gradientColors: ['#0D9488', '#0F766E'],
    shadowColor: '#0D9488',
    description:
      'Unified employee directory, leave management, automated payroll generation, performance reviews, and compliance tracking.',
    capabilities: [
      'Automated Payroll & Attendance Reconciliation',
      'Leave Accruals, Holidays & Shifts Engine',
      'Self-Service Employee Portal & Document Vault',
    ],
    metricsText: 'Coming Soon • Workforce Governance',
    actionText: 'Coming Soon',
    actionType: 'coming-soon',
    footerType: 'coming-soon',
    footerText: 'Coming Soon • Platform in development',
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
      'High-velocity deal stages, automated contact enrichment, multi-channel lead tracking, and revenue forecasting.',
    capabilities: [
      'Dynamic Kanban Pipeline & Deal Velocity',
      'Multi-Channel Inbound Lead Attribution',
      'Interactive Revenue Forecasting & Dashboards',
    ],
    metricsText: 'Coming Soon • Pipeline Velocity',
    actionText: 'Coming Soon',
    actionType: 'coming-soon',
    footerType: 'coming-soon',
    footerText: 'Coming Soon • Platform in development',
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
    footerType: 'coming-soon',
    footerText: 'Coming Soon • Agency in development',
  },
];

export const LandingUniverseScreen: React.FC<LandingUniverseScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const cardsSectionY = useRef<number>(450);
  const backboneTriggered = useRef(false);

  // Entrance animations
  const heroFadeAnim = useRef(new Animated.Value(0)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(25)).current;
  const bottomBarAnim = useRef(new Animated.Value(100)).current;

  // Backbone entrance animation
  const backboneOpacityAnim = useRef(new Animated.Value(0)).current;
  const backboneSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacityAnim, {
        toValue: 1,
        duration: 600,
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
    if (offsetY > 180) {
      triggerBackboneAnimation();
    }
    if (offsetY > 320) {
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

  const scrollToCards = () => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(cardsSectionY.current - 10, 360),
      animated: true,
    });
  };

  const handleCardAction = (card: PlatformCardData) => {
    if (card.actionType === 'internal-ats') {
      navigation.navigate('Login', { product: 'ats' });
    } else if (card.actionType === 'external' && card.externalUrl) {
      Linking.openURL(card.externalUrl);
    } else if (card.actionType === 'coming-soon') {
      Alert.alert(
        card.title,
        `${card.title} is currently under active enterprise development. Stay tuned for official rollout!`
      );
    }
  };

  return (
    <View style={styles.screenWrapper}>
      {/* Light status bar for London Blue (#005C82) header */}
      <StatusBar style="light" />

      {/* Enterprise Navigation Bar in London Blue (#005C82) matching Web Header */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 44 : 12) + 8 },
        ]}
      >
        <TouchableOpacity
          onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
          activeOpacity={0.85}
          style={styles.logoTouchable}
        >
          <Image
            source={require('../../../assets/thrm-universe-logo-v2.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={scrollToCards}
            style={styles.headerExploreBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="grid" size={13} color="#005C82" />
            <Text style={styles.headerExploreBtnText}>Explore</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login', { product: 'ats' })}
            style={styles.headerSignInBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.headerSignInText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
          colors={['#E8F3FA', '#F2F8FC', '#FFFFFF']}
          style={styles.heroBackgroundGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

        {/* SECTION 1: Viewport Hero Section with Ecosystem Understanding */}
        <Animated.View style={[styles.heroIntroContainer, { opacity: heroFadeAnim }]}>
          {/* Ecosystem Badge */}
          <View style={styles.heroBadge}>
            <Ionicons name="planet" size={13} color="#005C82" />
            <Text style={styles.heroBadgeText}>ONE UNIVERSE • EIGHT PLATFORMS</Text>
          </View>

          {/* Main Hero Title */}
          <Text style={styles.heroMainTitle}>
            One Universe.{'\n'}
            <Text style={styles.heroGradientTitle}>
              Eight Powerhouse Platforms &amp; Ventures.
            </Text>
          </Text>

          {/* Core Understanding Paragraph */}
          <Text style={styles.heroSubDescription}>
            The unified THRM operational ecosystem powering AI talent recruitment, intelligent client pipelines, workforce management, digital marketing, media productions, and tech education.
          </Text>

          {/* Live Metrics Ribbon matching Web View */}
          <View style={styles.metricsRibbonCard}>
            <View style={styles.metricColumn}>
              <Text style={[styles.metricNumber, { color: '#005C82' }]}>4x</Text>
              <Text style={styles.metricLabel}>Hiring Velocity</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricColumn}>
              <Text style={[styles.metricNumber, { color: '#007EA7' }]}>99.99%</Text>
              <Text style={styles.metricLabel}>Enterprise SLA</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricColumn}>
              <Text style={[styles.metricNumber, { color: '#004A69' }]}>8-in-1</Text>
              <Text style={styles.metricLabel}>Unified Ecosystem</Text>
            </View>
          </View>

          {/* Scroll Prompt with Chevron */}
          <TouchableOpacity
            onPress={scrollToCards}
            activeOpacity={0.75}
            style={styles.scrollPromptButton}
          >
            <Text style={styles.scrollPromptText}>SCROLL TO EXPLORE PRODUCTS &amp; VENTURES</Text>
            <Ionicons name="chevron-down" size={15} color="#005C82" />
          </TouchableOpacity>
        </Animated.View>

        {/* SECTION 2: All 8 Product Cards Container */}
        <Animated.View
          onLayout={(e) => {
            cardsSectionY.current = e.nativeEvent.layout.y;
          }}
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
                  <Text style={styles.capabilitiesHeader}>CORE CAPABILITIES &amp; SERVICES</Text>
                  {card.capabilities.map((cap, i) => (
                    <View key={i} style={styles.capabilityRow}>
                      <View
                        style={[
                          styles.checkIconBox,
                          { backgroundColor: `${card.badgeColor}18` },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={13}
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
                    { backgroundColor: `${card.badgeColor}0F`, borderColor: `${card.badgeColor}25` },
                  ]}
                >
                  <Ionicons name="flash" size={13} color={card.badgeColor} />
                  <Text style={[styles.metricsChipText, { color: '#1E293B' }]}>
                    {card.metricsText}
                  </Text>
                </View>

                {/* Action / Launch Button */}
                {isComingSoon ? (
                  <View
                    style={[
                      styles.comingSoonBox,
                      {
                        backgroundColor: `${card.badgeColor}12`,
                        borderColor: `${card.badgeColor}35`,
                      },
                    ]}
                  >
                    <Ionicons name="time-outline" size={15} color={card.badgeColor} />
                    <Text style={[styles.comingSoonText, { color: card.badgeColor }]}>
                      {card.actionText}
                    </Text>
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

                {/* Card Footer Actions matching Web */}
                <View style={styles.cardFooterDivider} />
                {card.footerType === 'auth' ? (
                  <View style={styles.cardAuthFooterRow}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Login', { product: 'ats' })}
                      activeOpacity={0.7}
                      style={styles.cardAuthSignInLink}
                    >
                      <Ionicons name="lock-closed" size={13} color="#005C82" />
                      <Text style={styles.cardAuthSignInText}>Sign In to ATS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('Register', { product: 'ats' })}
                      activeOpacity={0.7}
                      style={styles.cardAuthSignUpLink}
                    >
                      <Text style={styles.cardAuthSignUpText}>Sign Up</Text>
                      <Ionicons name="chevron-forward" size={12} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                ) : card.footerType === 'external' ? (
                  <TouchableOpacity
                    onPress={() => card.externalUrl && Linking.openURL(card.externalUrl)}
                    activeOpacity={0.7}
                    style={styles.cardExternalFooterLink}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.cardExternalFooterText, { color: card.badgeColor }]}
                    >
                      {card.footerText}
                    </Text>
                    <Ionicons name="chevron-forward" size={13} color={card.badgeColor} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.cardComingSoonFooterRow}>
                    <View style={[styles.pulseDot, { backgroundColor: card.badgeColor }]} />
                    <Text style={styles.cardComingSoonFooterText}>{card.footerText}</Text>
                  </View>
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
              Every application in the THRM Universe is deeply interconnected, ensuring zero data silos and smooth transitions across hiring, sales, and employee operations.
            </Text>
          </View>

          <View style={styles.pillarsGrid}>
            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="lock-closed" size={18} color="#005C82" />
              </View>
              <Text style={styles.pillarTitle}>Universal Identity</Text>
              <Text style={styles.pillarDesc}>
                Centralized authentication with multi-tenant workspace slugs and granular role-based permissions.
              </Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="hardware-chip" size={18} color="#005C82" />
              </View>
              <Text style={styles.pillarTitle}>AI Engine Integration</Text>
              <Text style={styles.pillarDesc}>
                Automated document parsing, smart candidate scoring, and predictive sales pipeline analytics.
              </Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="shield-checkmark" size={18} color="#005C82" />
              </View>
              <Text style={styles.pillarTitle}>Isolated Security</Text>
              <Text style={styles.pillarDesc}>
                Complete row-level tenant isolation, audit logging, and automated cloud backups.
              </Text>
            </View>

            <View style={styles.pillarTile}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="phone-portrait" size={18} color="#005C82" />
              </View>
              <Text style={styles.pillarTitle}>Mobile Companion</Text>
              <Text style={styles.pillarDesc}>
                Native Android mobile app providing real-time push alerts, interview reviews, and approval actions.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* SECTION 4: Production-Grade Enterprise Footer (London Blue matching Web) */}
        <View style={styles.footerContainer}>
          <Image
            source={require('../../../assets/thrm-universe-logo-v2.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />

          <Text style={styles.footerDescription}>
            Unified enterprise operating ecosystem connecting talent recruitment intelligence, deal pipelines, and workforce operations with zero data silos.
          </Text>

          {/* Alliance Badge matching Web */}
          <View style={styles.footerAllianceBadge}>
            <View style={styles.allianceDot} />
            <Text style={styles.footerAllianceText}>
              THRM Universe is in alliance with THRM Business Solutions OPC Private Limited
            </Text>
          </View>

          {/* Platforms Directory */}
          <View style={styles.footerDirectoryBox}>
            <Text style={styles.footerDirectoryHeading}>PLATFORMS &amp; VENTURES</Text>
            <View style={styles.footerLinksGrid}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login', { product: 'ats' })}
                style={styles.footerLinkRow}
              >
                <Ionicons name="chevron-forward" size={12} color="#BAE6FD" />
                <Text style={styles.footerLinkText}>THRM ATS (Recruitment)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://thehrmindset.org/')}
                style={styles.footerLinkRow}
              >
                <Ionicons name="chevron-forward" size={12} color="#BAE6FD" />
                <Text style={styles.footerLinkText}>The HR Mindset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://thrmdigitalmarketing.in/')}
                style={styles.footerLinkRow}
              >
                <Ionicons name="chevron-forward" size={12} color="#BAE6FD" />
                <Text style={styles.footerLinkText}>THRM Digital Marketing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://thrmproductions.in/')}
                style={styles.footerLinkRow}
              >
                <Ionicons name="chevron-forward" size={12} color="#BAE6FD" />
                <Text style={styles.footerLinkText}>THRM Productions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('https://thrmedutech.in')}
                style={styles.footerLinkRow}
              >
                <Ionicons name="chevron-forward" size={12} color="#BAE6FD" />
                <Text style={styles.footerLinkText}>THRM EduTech</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerDivider} />

          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} THRM Universe. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Quick Action Bar when scrolled down */}
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
            <Text style={styles.floatingBarSub}>Launch your enterprise workspace</Text>
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
    backgroundColor: '#F4F9FD',
  },

  /* Enterprise London Blue Navigation Header matching Web */
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#005C82',
    borderBottomWidth: 1,
    borderBottomColor: '#004766',
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#002D42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoTouchable: {
    justifyContent: 'center',
  },
  headerLogo: {
    width: 175,
    height: 48,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerExploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  headerExploreBtnText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#005C82',
  },
  headerSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerSignInText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  scrollContent: {
    position: 'relative',
  },
  heroBackgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 480,
  },

  /* Hero Section */
  heroIntroContainer: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 92, 130, 0.25)',
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  heroBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#005C82',
    letterSpacing: 0.5,
  },
  heroMainTitle: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    fontWeight: '900',
    color: '#002D42',
    textAlign: 'center',
    lineHeight: 31,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  heroGradientTitle: {
    color: '#005C82',
    fontWeight: '900',
  },
  heroSubDescription: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
    marginBottom: 18,
  },

  /* 3-Column Live Metrics Ribbon matching Web */
  metricsRibbonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 92, 130, 0.18)',
    ...Platform.select({
      ios: {
        shadowColor: '#005C82',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
    marginBottom: 16,
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
  },
  metricNumber: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0, 92, 130, 0.15)',
  },

  scrollPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  scrollPromptText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    color: '#005C82',
    letterSpacing: 0.6,
  },

  /* Product Cards Section */
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 16,
    paddingTop: 6,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 92, 130, 0.16)',
    ...Platform.select({
      ios: {
        shadowColor: '#005C82',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryBadgePill: {
    paddingVertical: 3.5,
    paddingHorizontal: 9,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  titleRow: {
    marginBottom: 8,
  },
  productTitle: {
    fontFamily: FONTS.heading,
    fontSize: 19,
    fontWeight: '900',
    color: '#002D42',
    letterSpacing: -0.2,
  },
  productSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  productDescription: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },

  capabilitiesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 7,
  },
  capabilitiesHeader: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#005C82',
    marginBottom: 2,
  },
  capabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  checkIconBox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capabilityText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
    lineHeight: 15.5,
  },

  metricsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 12,
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
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  comingSoonText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '800',
  },

  launchButtonTouchable: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  launchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 16,
  },
  launchButtonText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  cardFooterDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 92, 130, 0.1)',
    marginTop: 12,
    marginBottom: 10,
  },
  cardAuthFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  cardAuthSignInLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardAuthSignInText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '800',
    color: '#005C82',
  },
  cardAuthSignUpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardAuthSignUpText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  cardExternalFooterLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  cardExternalFooterText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  cardComingSoonFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  cardComingSoonFooterText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  /* Enterprise Backbone Section */
  backboneCard: {
    marginTop: 28,
    marginHorizontal: 16,
    backgroundColor: '#EAF3FA',
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 92, 130, 0.2)',
  },
  backboneHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  backboneTitle: {
    fontFamily: FONTS.heading,
    fontSize: 17,
    fontWeight: '800',
    color: '#002D42',
    textAlign: 'center',
    marginBottom: 6,
  },
  backboneSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16.5,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  pillarTile: {
    width: (width - 76) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 92, 130, 0.15)',
    ...SHADOWS.sm,
  },
  pillarIconCircle: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    backgroundColor: '#E8F4FA',
    borderWidth: 1,
    borderColor: 'rgba(0, 92, 130, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pillarTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#002D42',
    marginBottom: 4,
  },
  pillarDesc: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 14.5,
  },

  /* Enterprise Footer Section in London Blue (#005C82) matching Web */
  footerContainer: {
    marginTop: 32,
    backgroundColor: '#005C82',
    borderTopWidth: 1,
    borderTopColor: '#004766',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerLogo: {
    width: 220,
    height: 64,
    marginBottom: 10,
  },
  footerDescription: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    lineHeight: 16.5,
    marginBottom: 14,
  },
  footerAllianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: 18,
  },
  allianceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  footerAllianceText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '600',
    color: '#E0F2FE',
    textAlign: 'center',
    flex: 1,
  },
  footerDirectoryBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16,
  },
  footerDirectoryHeading: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '800',
    color: '#BAE6FD',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  footerLinksGrid: {
    gap: 8,
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLinkText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#F0F9FF',
    fontWeight: '500',
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginVertical: 12,
  },
  footerCopyright: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  /* Floating Bottom Quick Action Bar */
  floatingBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
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
    color: '#002D42',
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
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  floatingLaunchText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
