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
import { Header } from '../../components/Header';
import { StatCard } from '../../components/StatCard';
import { StageBadge } from '../../components/StageBadge';
import { ScorePill } from '../../components/ScorePill';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ats-dashboard'],
    queryFn: atsApi.getDashboardMetrics,
  });

  if (isLoading && !isRefetching) {
    return <LoadingSpinner message="Loading ATS Dashboard..." />;
  }

  const kpis = data?.kpis || {
    openJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    scheduledInterviews: 0,
    avgAtsScore: 0,
  };

  const handleOpenMeeting = (link?: string) => {
    if (link) {
      Linking.openURL(link);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="ATS Overview" showLogout />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#4F46E5']} />
        }
      >
        {/* KPI Grid */}
        <Text style={styles.sectionHeader}>Key Metrics</Text>
        <View style={styles.kpiGrid}>
          <StatCard
            label="Open Positions"
            value={kpis.openJobs}
            iconName="briefcase-outline"
            color="#4F46E5"
            bgColor="#EEF2FF"
          />
          <StatCard
            label="Candidates"
            value={kpis.totalCandidates}
            iconName="people-outline"
            color="#059669"
            bgColor="#ECFDF5"
          />
          <StatCard
            label="In Pipeline"
            value={kpis.totalApplications}
            iconName="git-network-outline"
            color="#D97706"
            bgColor="#FEF3C7"
          />
          <StatCard
            label="Interviews"
            value={kpis.scheduledInterviews}
            iconName="calendar-outline"
            color="#9333EA"
            bgColor="#FAF5FF"
          />
        </View>

        {/* Upcoming Interviews Widget */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeader}>Upcoming Interviews</Text>
          <TouchableOpacity onPress={() => navigation.navigate('InterviewsTab')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {data?.upcomingInterviews && data.upcomingInterviews.length > 0 ? (
          data.upcomingInterviews.slice(0, 3).map((interview) => (
            <View key={interview.id} style={styles.interviewCard}>
              <View style={styles.interviewInfo}>
                <Text style={styles.interviewTitle}>{interview.title}</Text>
                <Text style={styles.interviewCandidate}>
                  {interview.candidate?.firstName} {interview.candidate?.lastName} • {interview.job?.title}
                </Text>
                <Text style={styles.interviewTime}>
                  {new Date(interview.scheduledAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {interview.meetingLink ? (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleOpenMeeting(interview.meetingLink)}
                >
                  <Ionicons name="videocam" size={16} color="#FFFFFF" />
                  <Text style={styles.joinButtonText}>Meet</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        ) : (
          <View style={styles.cardEmpty}>
            <Text style={styles.cardEmptyText}>No interviews scheduled today</Text>
          </View>
        )}

        {/* Recent Applications Feed */}
        <View style={[styles.sectionTitleRow, { marginTop: 24 }]}>
          <Text style={styles.sectionHeader}>Recent Applications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CandidatesTab')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {data?.recentApplications && data.recentApplications.length > 0 ? (
          data.recentApplications.slice(0, 5).map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.applicationCard}
              onPress={() =>
                navigation.navigate('CandidatesTab', {
                  screen: 'CandidateDetail',
                  params: { candidateId: app.candidateId },
                })
              }
            >
              <View style={styles.appHeader}>
                <View style={styles.appCandidateInfo}>
                  <Text style={styles.candidateName}>
                    {app.candidate?.firstName} {app.candidate?.lastName}
                  </Text>
                  <Text style={styles.jobName} numberOfLines={1}>
                    {app.job?.title}
                  </Text>
                </View>
                <ScorePill score={app.atsScore} />
              </View>

              <View style={styles.appFooter}>
                <StageBadge stageName={app.currentStage?.name || 'Applied'} />
                <Text style={styles.appliedDate}>
                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            title="No applications yet"
            description="When candidates submit applications, they will appear here in real-time."
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  interviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  interviewInfo: {
    flex: 1,
    marginRight: 10,
  },
  interviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  interviewCandidate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  interviewTime: {
    fontSize: 11,
    color: '#4F46E5',
    marginTop: 4,
    fontWeight: '600',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  cardEmpty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  cardEmptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  appCandidateInfo: {
    flex: 1,
    marginRight: 8,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  jobName: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  appFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  appliedDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
