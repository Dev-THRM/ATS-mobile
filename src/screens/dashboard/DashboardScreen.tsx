import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { StatCard } from '../../components/StatCard';
import { StageBadge } from '../../components/StageBadge';
import { ScorePill } from '../../components/ScorePill';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ats-dashboard'],
    queryFn: atsApi.getDashboardMetrics,
  });

  if (isLoading && !isRefetching) {
    return <LoadingSpinner message="Loading talent dashboard..." />;
  }

  const kpis = data?.kpis || {
    activeJobsCount: 0,
    totalJobsCount: 0,
    totalCandidates: 0,
    activeApplications: 0,
    hiredCount: 0,
    rejectedCount: 0,
    upcomingInterviewsCount: 0,
  };

  const handleOpenMeeting = (link?: string) => {
    if (link) {
      const url = link.startsWith('http') ? link : `https://${link}`;
      Linking.openURL(url);
    }
  };

  const recentApps = Array.isArray(data?.recentApplications) ? data.recentApplications : [];
  const upcomingInterviews = Array.isArray(data?.upcomingInterviews) ? data.upcomingInterviews : [];

  const firstName = user?.firstName || 'Recruiter';
  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <Header
        title="Talent Overview"
        subtitle={todayStr}
        showLogout
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
        }
      >
        {/* Soft Light Blue & White Welcome Card */}
        <View style={styles.lightWelcomeCard}>
          <View style={styles.welcomeTopRow}>
            <View style={styles.welcomeTextGroup}>
              <Text style={styles.welcomeGreeting}>Welcome back, {firstName} 👋</Text>
              <Text style={styles.welcomeSubtitle}>
                <Text style={styles.highlightNumber}>{kpis.activeApplications} candidates</Text> active across {kpis.activeJobsCount} positions.
              </Text>
            </View>

            <View style={styles.liveIndicatorPill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveIndicatorText}>Live AI</Text>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.outlineActionBtn}
              onPress={() => navigation.navigate('JobsTab')}
              activeOpacity={0.7}
            >
              <Ionicons name="briefcase-outline" size={14} color={COLORS.primary} />
              <Text style={styles.outlineActionText}>Requisitions ({kpis.activeJobsCount})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => navigation.navigate('CandidatesTab')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add-outline" size={14} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>+ Candidate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 1: KPI Grid */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Key Talent Metrics</Text>
          <Text style={styles.sectionSubtitle}>Live Stats</Text>
        </View>

        <View style={styles.kpiGrid}>
          <StatCard
            label="Active Positions"
            value={kpis.activeJobsCount}
            iconName="briefcase-outline"
            color={COLORS.primary}
            bgColor={COLORS.primaryLight}
            trend="Open"
            onPress={() => navigation.navigate('JobsTab')}
          />
          <StatCard
            label="Total Talent Pool"
            value={kpis.totalCandidates}
            iconName="people-outline"
            color={COLORS.success}
            bgColor={COLORS.successLight}
            trend="+New"
            onPress={() => navigation.navigate('CandidatesTab')}
          />
          <StatCard
            label="In Active Review"
            value={kpis.activeApplications}
            iconName="git-pull-request-outline"
            color={COLORS.warning}
            bgColor={COLORS.warningLight}
            trend="Pipeline"
            onPress={() => navigation.navigate('JobsTab')}
          />
          <StatCard
            label="Scheduled Rounds"
            value={kpis.upcomingInterviewsCount}
            iconName="calendar-outline"
            color={COLORS.accent}
            bgColor={COLORS.accentLight}
            trend="Upcoming"
            onPress={() => navigation.navigate('InterviewsTab')}
          />
        </View>

        {/* Section 2: Pipeline Progression Funnel */}
        <View style={styles.funnelCard}>
          <View style={styles.funnelHeader}>
            <View style={styles.funnelTitleGroup}>
              <Ionicons name="filter-outline" size={16} color={COLORS.primary} />
              <Text style={styles.funnelTitle}>Hiring Funnel</Text>
            </View>
            <Text style={styles.funnelBadge}>
              {kpis.hiredCount} Hired • {kpis.rejectedCount} Archived
            </Text>
          </View>

          <View style={styles.funnelStagesRow}>
            <View style={styles.funnelStageCol}>
              <Text style={styles.funnelCount}>{kpis.activeApplications}</Text>
              <Text style={styles.funnelLabel}>Applied</Text>
              <View style={[styles.funnelBar, { backgroundColor: '#38BDF8' }]} />
            </View>
            <View style={styles.funnelArrow}>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textLight} />
            </View>
            <View style={styles.funnelStageCol}>
              <Text style={styles.funnelCount}>{kpis.upcomingInterviewsCount}</Text>
              <Text style={styles.funnelLabel}>Interview</Text>
              <View style={[styles.funnelBar, { backgroundColor: '#F59E0B' }]} />
            </View>
            <View style={styles.funnelArrow}>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textLight} />
            </View>
            <View style={styles.funnelStageCol}>
              <Text style={styles.funnelCount}>{kpis.hiredCount}</Text>
              <Text style={styles.funnelLabel}>Offers</Text>
              <View style={[styles.funnelBar, { backgroundColor: '#10B981' }]} />
            </View>
          </View>
        </View>

        {/* Section 3: Scheduled Interview Rounds */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Scheduled Interviews</Text>
          <TouchableOpacity onPress={() => navigation.navigate('InterviewsTab')}>
            <Text style={styles.linkText}>View all →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionBlock}>
          {upcomingInterviews.length > 0 ? (
            upcomingInterviews.slice(0, 3).map((interview) => (
              <View key={interview.id} style={styles.interviewCard}>
                <View style={styles.interviewAvatar}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                </View>

                <View style={styles.interviewInfo}>
                  <Text style={styles.interviewTitle} numberOfLines={1}>
                    {interview.title}
                  </Text>
                  <Text style={styles.interviewCandidate}>
                    {interview.candidateName || 'Candidate'} • {interview.jobTitle || 'Role'}
                  </Text>
                  <View style={styles.interviewTimeRow}>
                    <Ionicons name="time-outline" size={12} color={COLORS.primary} />
                    <Text style={styles.interviewTime}>
                      {new Date(interview.scheduledAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>

                {interview.meetingLink ? (
                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => handleOpenMeeting(interview.meetingLink)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="videocam-outline" size={13} color="#FFFFFF" />
                    <Text style={styles.joinButtonText}>Meet</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyWidgetCard}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.textLight} style={{ marginBottom: 6 }} />
              <Text style={styles.emptyWidgetTitle}>No interviews scheduled today</Text>
            </View>
          )}
        </View>

        {/* Section 4: Live Candidate Stream with AI Fit Scores */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CandidatesTab')}>
            <Text style={styles.linkText}>Talent Pool →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionBlock}>
          {recentApps.length > 0 ? (
            recentApps.slice(0, 5).map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.candidateCard}
                onPress={() => navigation.navigate('CandidatesTab')}
                activeOpacity={0.7}
              >
                <View style={styles.candidateTop}>
                  <View style={styles.candidateAvatar}>
                    <Text style={styles.candidateAvatarText}>
                      {app.candidateName?.[0] || 'C'}
                    </Text>
                  </View>
                  <View style={styles.candidateMeta}>
                    <Text style={styles.candidateName}>{app.candidateName || 'Applicant'}</Text>
                    <Text style={styles.candidateRole} numberOfLines={1}>
                      {app.jobTitle || 'Role'} {app.department ? `• ${app.department}` : ''}
                    </Text>
                  </View>
                  {app.atsScore !== undefined ? <ScorePill score={app.atsScore} /> : null}
                </View>

                <View style={styles.candidateBottom}>
                  <StageBadge stageName={app.currentStage || 'Applied'} />
                  <Text style={styles.candidateDate}>
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <EmptyState
              iconName="people-outline"
              title="Awaiting applications"
              description="Applications submitted from career portals will show up here."
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
  },
  lightWelcomeCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSky,
    ...SHADOWS.sm,
  },
  welcomeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  welcomeTextGroup: {
    flex: 1,
    marginRight: 10,
  },
  welcomeGreeting: {
    fontFamily: FONTS.family,
    fontSize: 16.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  welcomeSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 19,
  },
  highlightNumber: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  liveIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSky,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  liveIndicatorText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  outlineActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSky,
  },
  outlineActionText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 5,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
  },
  primaryActionText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  linkText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.primary,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  funnelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  funnelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  funnelTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  funnelTitle: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  funnelBadge: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textMuted,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  funnelStagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  funnelStageCol: {
    flex: 1,
    alignItems: 'center',
  },
  funnelCount: {
    fontFamily: FONTS.family,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  funnelLabel: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  funnelBar: {
    height: 4,
    width: '75%',
    borderRadius: 2,
  },
  funnelArrow: {
    paddingHorizontal: 4,
  },
  interviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  interviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  interviewInfo: {
    flex: 1,
    marginRight: 8,
  },
  interviewTitle: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  interviewCandidate: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  interviewTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  interviewTime: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
  },
  joinButtonText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyWidgetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyWidgetTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
  candidateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  candidateTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  candidateAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  candidateAvatarText: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  candidateMeta: {
    flex: 1,
    marginRight: 8,
  },
  candidateName: {
    fontFamily: FONTS.family,
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  candidateRole: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  candidateBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  candidateDate: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
