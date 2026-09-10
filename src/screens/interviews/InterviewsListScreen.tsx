import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Modal,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { SubmitFeedbackModal } from './SubmitFeedbackModal';
import { Interview } from '../../types/ats.types';

export const InterviewsListScreen: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELED'>('ALL');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const { data: interviews, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ats-interviews'],
    queryFn: () => atsApi.getInterviews(),
  });

  const filteredInterviews = (interviews || []).filter((i) => {
    if (filter === 'ALL') return true;
    return i.status === filter;
  });

  const handleOpenMeet = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleOpenFeedback = (interview: Interview) => {
    setSelectedInterview(interview);
    setFeedbackModalOpen(true);
  };

  const renderInterview = ({ item }: { item: Interview }) => {
    const getStatusTheme = (st: string) => {
      switch (st) {
        case 'SCHEDULED':
          return { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' };
        case 'COMPLETED':
          return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
        case 'CANCELED':
          return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
        default:
          return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
      }
    };

    const statusTheme = getStatusTheme(item.status);

    return (
      <View style={styles.card}>
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.interviewTitle}>{item.title}</Text>
            <Text style={styles.typeText}>{item.type || 'TECHNICAL'} ROUND</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg, borderColor: statusTheme.border }]}>
            <Text style={[styles.statusBadgeText, { color: statusTheme.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Candidate & Job Info */}
        <View style={styles.candidateRow}>
          <View style={styles.miniAvatar}>
            <Text style={styles.miniAvatarText}>
              {item.candidate?.firstName?.[0]}
              {item.candidate?.lastName?.[0]}
            </Text>
          </View>
          <View style={styles.candidateText}>
            <Text style={styles.candidateName}>
              {item.candidate?.firstName} {item.candidate?.lastName}
            </Text>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.job?.title}
            </Text>
          </View>
        </View>

        {/* Scheduled Time & Details */}
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={16} color="#64748B" />
          <Text style={styles.timeText}>
            {new Date(item.scheduledAt).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            ({item.durationMinutes || 45} mins)
          </Text>
        </View>

        {/* Existing Feedback if completed */}
        {item.feedbackRating ? (
          <View style={styles.existingFeedback}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= (item.feedbackRating || 0) ? 'star' : 'star-outline'}
                  size={14}
                  color="#F59E0B"
                />
              ))}
              <Text style={styles.ratingScore}>{item.feedbackRating}/5 Scorecard</Text>
            </View>
            {item.feedbackNotes ? (
              <Text style={styles.feedbackNotesText} numberOfLines={2}>
                "{item.feedbackNotes}"
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Actions Bar */}
        <View style={styles.cardActions}>
          {item.meetingLink ? (
            <TouchableOpacity
              style={styles.meetButton}
              onPress={() => handleOpenMeet(item.meetingLink)}
            >
              <Ionicons name="videocam" size={16} color="#FFFFFF" />
              <Text style={styles.meetButtonText}>Join Meet</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.scorecardButton}
            onPress={() => handleOpenFeedback(item)}
          >
            <Ionicons name="create-outline" size={16} color="#4F46E5" />
            <Text style={styles.scorecardButtonText}>
              {item.feedbackRating ? 'Edit Scorecard' : 'Add Scorecard'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Interview Hub" subtitle="Calendar & candidate scorecards" />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELED'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.activeFilterTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && styles.activeFilterTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Interviews List */}
      {isLoading && !isRefetching ? (
        <LoadingSpinner message="Loading scheduled interviews..." />
      ) : (
        <FlatList
          data={filteredInterviews}
          keyExtractor={(item) => item.id}
          renderItem={renderInterview}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#4F46E5']} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="calendar-outline"
              title="No interviews found"
              description="Schedule interviews from candidate applications to track them here."
            />
          }
        />
      )}

      {/* Submit Feedback Modal */}
      {selectedInterview ? (
        <SubmitFeedbackModal
          visible={feedbackModalOpen}
          interview={selectedInterview}
          onClose={() => {
            setFeedbackModalOpen(false);
            setSelectedInterview(null);
          }}
          onSuccess={() => {
            refetch();
            setFeedbackModalOpen(false);
            setSelectedInterview(null);
          }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: '#4F46E5',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  interviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
  },
  candidateText: {
    flex: 1,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  jobTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginLeft: 6,
  },
  existingFeedback: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 6,
  },
  feedbackNotesText: {
    fontSize: 12,
    color: '#78350F',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  meetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 8,
  },
  meetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  scorecardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  scorecardButtonText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
