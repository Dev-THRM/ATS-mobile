import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { SubmitFeedbackModal } from './SubmitFeedbackModal';
import { Interview, InterviewStatus, InterviewType } from '../../types/ats.types';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Canceled', value: 'CANCELED' },
];

const INTERVIEW_TYPES: Array<{ label: string; value: InterviewType }> = [
  { label: 'Screening', value: 'SCREENING' },
  { label: 'Technical', value: 'TECHNICAL' },
  { label: 'System Design', value: 'SYSTEM_DESIGN' },
  { label: 'Behavioral', value: 'BEHAVIORAL' },
  { label: 'Managerial', value: 'MANAGERIAL' },
  { label: 'HR Final', value: 'HR_FINAL' },
];

export const InterviewsListScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const [feedbackModalVisible, setFeedbackModalVisible] = useState<boolean>(false);
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState<Interview | null>(null);

  const [scheduleModalVisible, setScheduleModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<InterviewType>('TECHNICAL');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<string>('45');
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [locationNotes, setLocationNotes] = useState<string>('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');

  const {
    data: interviewsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['ats-interviews', selectedStatus],
    queryFn: () => atsApi.getInterviews(selectedStatus ? { status: selectedStatus } : undefined),
  });

  const { data: applicationsData } = useQuery({
    queryKey: ['ats-applications-for-interviews'],
    queryFn: () => atsApi.getApplications({ limit: 50 }),
    enabled: scheduleModalVisible,
  });

  const interviewsList: Interview[] = Array.isArray(interviewsData)
    ? interviewsData
    : (interviewsData as any)?.data || (interviewsData as any)?.interviews || [];

  const applicationsList = Array.isArray(applicationsData)
    ? applicationsData
    : (applicationsData as any)?.data || (applicationsData as any)?.applications || [];

  const filteredInterviews = interviewsList.filter((item) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const candidateName = `${item.candidate?.firstName || ''} ${item.candidate?.lastName || ''}`.toLowerCase();
    const jobTitle = (item.job?.title || '').toLowerCase();
    const interviewTitle = (item.title || '').toLowerCase();
    return candidateName.includes(query) || jobTitle.includes(query) || interviewTitle.includes(query);
  });

  const scheduleMutation = useMutation({
    mutationFn: atsApi.scheduleInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ats-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      setScheduleModalVisible(false);
      resetScheduleForm();
      Alert.alert('Success', 'Interview scheduled successfully.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to schedule interview';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const resetScheduleForm = () => {
    setTitle('');
    setType('TECHNICAL');
    setScheduledAt('');
    setDurationMinutes('45');
    setMeetingLink('');
    setLocationNotes('');
    setSelectedApplicationId('');
  };

  const handleOpenSchedule = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    setScheduledAt(tomorrow.toISOString());
    setTitle('Technical Round 1');
    setScheduleModalVisible(true);
  };

  const handleScheduleSubmit = () => {
    if (!selectedApplicationId) {
      Alert.alert('Validation Error', 'Please select an application.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title.');
      return;
    }
    if (!scheduledAt.trim()) {
      Alert.alert('Validation Error', 'Please provide date/time.');
      return;
    }

    const duration = parseInt(durationMinutes, 10) || 45;
    const selectedApp = applicationsList.find((a: any) => a.id === selectedApplicationId);

    scheduleMutation.mutate({
      applicationId: selectedApplicationId,
      candidateId: selectedApp?.candidateId,
      jobId: selectedApp?.jobId,
      title: title.trim(),
      type,
      scheduledAt: scheduledAt.trim(),
      durationMinutes: duration,
      meetingLink: meetingLink.trim() || undefined,
      locationNotes: locationNotes.trim() || undefined,
    });
  };

  const handleOpenMeeting = (link?: string) => {
    if (link) {
      const url = link.startsWith('http') ? link : `https://${link}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not launch meeting.');
      });
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadgeStyle = (status: InterviewStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', label: 'Upcoming' };
      case 'COMPLETED':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', label: 'Completed' };
      case 'CANCELED':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Canceled' };
      case 'RESCHEDULED':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', label: 'Rescheduled' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', label: status };
    }
  };

  const renderInterviewCard = ({ item }: { item: Interview }) => {
    const badge = getStatusBadgeStyle(item.status);
    const candidateName = item.candidate
      ? `${item.candidate.firstName} ${item.candidate.lastName}`
      : 'Candidate';
    const jobTitle = item.job?.title || 'Open Role';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.interviewTitle}>{item.title}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={13} color={COLORS.primary} style={styles.detailIcon} />
            <Text style={styles.candidateName}>{candidateName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="briefcase-outline" size={13} color={COLORS.textSecondary} style={styles.detailIcon} />
            <Text style={styles.jobText}>{jobTitle}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} style={styles.detailIcon} />
            <Text style={styles.timeText}>
              {formatDateTime(item.scheduledAt)} • {item.durationMinutes || 45} mins
            </Text>
          </View>

          {item.feedbackRating ? (
            <View style={styles.ratingBadgeRow}>
              <View style={styles.starsPreview}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={s <= (item.feedbackRating || 0) ? 'star' : 'star-outline'}
                    size={12}
                    color="#F59E0B"
                  />
                ))}
              </View>
              {item.feedbackNotes ? (
                <Text style={styles.feedbackSnippet} numberOfLines={1}>
                  "{item.feedbackNotes}"
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          {item.meetingLink ? (
            <TouchableOpacity
              style={styles.meetingButton}
              onPress={() => handleOpenMeeting(item.meetingLink)}
              activeOpacity={0.7}
            >
              <Ionicons name="videocam-outline" size={14} color="#FFFFFF" />
              <Text style={styles.meetingButtonText}>Join Call</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <TouchableOpacity
            style={[styles.scorecardButton, item.feedbackRating ? styles.scorecardButtonDone : null]}
            onPress={() => {
              setSelectedInterviewForFeedback(item);
              setFeedbackModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.feedbackRating ? 'checkmark-circle-outline' : 'clipboard-outline'}
              size={14}
              color={item.feedbackRating ? COLORS.success : COLORS.primary}
            />
            <Text
              style={[
                styles.scorecardButtonText,
                { color: item.feedbackRating ? COLORS.success : COLORS.primary },
              ]}
            >
              {item.feedbackRating ? 'Edit Scorecard' : 'Score Candidate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Interviews"
        subtitle={`${interviewsList.length} Sessions`}
      />

      <View style={styles.topBar}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={16} color={COLORS.textLight} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search candidate, role, round..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity style={styles.scheduleButton} onPress={handleOpenSchedule} activeOpacity={0.8}>
          <Ionicons name="add" size={17} color="#FFFFFF" />
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((filter) => {
            const isSelected = selectedStatus === filter.value;
            return (
              <TouchableOpacity
                key={filter.label}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedStatus(filter.value)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Interview List */}
      {isLoading && !isRefetching ? (
        <LoadingSpinner message="Loading interviews..." />
      ) : (
        <FlatList
          data={filteredInterviews}
          keyExtractor={(item) => item.id}
          renderItem={renderInterviewCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="calendar-outline"
              title="No interviews found"
              description="Tap 'Schedule' to create an interview round."
            />
          }
        />
      )}

      {selectedInterviewForFeedback ? (
        <SubmitFeedbackModal
          visible={feedbackModalVisible}
          interview={selectedInterviewForFeedback}
          onClose={() => {
            setFeedbackModalVisible(false);
            setSelectedInterviewForFeedback(null);
          }}
        />
      ) : null}

      {/* Schedule Modal */}
      <Modal
        visible={scheduleModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Schedule Interview</Text>
                <Text style={styles.modalSub}>Set up an evaluation round</Text>
              </View>
              <TouchableOpacity onPress={() => setScheduleModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Candidate Application *</Text>
                {applicationsList.length === 0 ? (
                  <Text style={styles.helperText}>No active applications.</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.appsScroll}>
                    {applicationsList.map((app: any) => {
                      const isSel = selectedApplicationId === app.id;
                      const cName = `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`;
                      const jTitle = app.job?.title || 'Role';
                      return (
                        <TouchableOpacity
                          key={app.id}
                          style={[styles.appOptionCard, isSel && styles.appOptionCardActive]}
                          onPress={() => setSelectedApplicationId(app.id)}
                        >
                          <Text style={[styles.appOptionName, isSel && styles.appOptionTextActive]}>
                            {cName}
                          </Text>
                          <Text style={[styles.appOptionJob, isSel && styles.appOptionTextActive]} numberOfLines={1}>
                            {jTitle}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Round Title *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Technical Round 1 - React & Node"
                  placeholderTextColor={COLORS.textLight}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date & Time (ISO string) *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="2026-09-12T14:00:00.000Z"
                  placeholderTextColor={COLORS.textLight}
                  value={scheduledAt}
                  onChangeText={setScheduledAt}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="45"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="numeric"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Meeting Link</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                  value={meetingLink}
                  onChangeText={setMeetingLink}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setScheduleModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, scheduleMutation.isPending && styles.disabledButton]}
                onPress={handleScheduleSubmit}
                disabled={scheduleMutation.isPending}
              >
                {scheduleMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Schedule</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    height: 38,
    marginRight: 8,
  },
  searchInput: {
    fontFamily: FONTS.family,
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: RADIUS.sm,
  },
  scheduleButtonText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12.5,
    marginLeft: 3,
  },
  filtersContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: 6,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  interviewTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  typeBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8.5,
    paddingVertical: 3.5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '500',
  },
  detailsSection: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
  },
  candidateName: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  jobText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timeText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#FFFBEB',
    padding: 6,
    borderRadius: RADIUS.xs,
  },
  starsPreview: {
    flexDirection: 'row',
    marginRight: 6,
  },
  feedbackSnippet: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#92400E',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
    marginTop: 4,
  },
  meetingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  meetingButtonText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  scorecardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  scorecardButtonDone: {
    backgroundColor: COLORS.successLight,
  },
  scorecardButtonText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '500',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalSub: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  modalScroll: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  helperText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  appsScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  appOptionCard: {
    padding: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 110,
  },
  appOptionCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryHover,
  },
  appOptionName: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  appOptionJob: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  appOptionTextActive: {
    color: '#FFFFFF',
  },
  modalInput: {
    fontFamily: FONTS.family,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  typeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 6,
    marginBottom: 6,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
  },
  typeChipText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  cancelButton: {
    flex: 1,
    height: 42,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 8,
  },
  cancelButtonText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  submitButton: {
    flex: 2,
    height: 42,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
