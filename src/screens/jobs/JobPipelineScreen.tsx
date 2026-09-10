import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { ScorePill } from '../../components/ScorePill';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Application, PipelineStage } from '../../types/ats.types';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

export const JobPipelineScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { jobId, jobTitle } = route.params;
  const queryClient = useQueryClient();

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [transitionModalVisible, setTransitionModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [targetStageId, setTargetStageId] = useState<string>('');
  const [transitionNotes, setTransitionNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const { data: stagesData, isLoading: loadingStages } = useQuery({
    queryKey: ['job-stages', jobId],
    queryFn: () => atsApi.getJobStages(jobId),
  });

  const {
    data: applicationsData,
    isLoading: loadingApps,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => atsApi.getApplications({ jobId }),
  });

  const stages: PipelineStage[] = Array.isArray(stagesData)
    ? stagesData
    : (stagesData as any)?.stages || (stagesData as any)?.data || [];

  const applications: Application[] = Array.isArray(applicationsData)
    ? applicationsData
    : (applicationsData as any)?.applications || (applicationsData as any)?.data || [];

  const filteredApps = applications.filter((app) => {
    if (!selectedStageId) return true;
    return app.currentStageId === selectedStageId;
  });

  const updateStageMutation = useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: { stageId: string; notes?: string; rejectionReason?: string };
    }) => atsApi.updateApplicationStage(appId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      setTransitionModalVisible(false);
      setSelectedApplication(null);
      setTransitionNotes('');
      setRejectionReason('');
      Alert.alert('Success', 'Candidate stage updated.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to move stage.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const handleOpenTransitionModal = (app: Application) => {
    setSelectedApplication(app);
    setTargetStageId(app.currentStageId || (stages[0]?.id ?? ''));
    setTransitionNotes('');
    setRejectionReason('');
    setTransitionModalVisible(true);
  };

  const handleConfirmTransition = () => {
    if (!selectedApplication || !targetStageId) return;

    const chosenStage = stages.find((s) => s.id === targetStageId);
    const isRejectStage =
      chosenStage?.isRejected ||
      chosenStage?.name?.toLowerCase().includes('reject') ||
      chosenStage?.stageType?.toLowerCase().includes('reject');

    if (isRejectStage && !rejectionReason.trim()) {
      Alert.alert('Reason Required', 'Please document why candidate was rejected.');
      return;
    }

    updateStageMutation.mutate({
      appId: selectedApplication.id,
      payload: {
        stageId: targetStageId,
        notes: transitionNotes.trim() || undefined,
        rejectionReason: isRejectStage ? rejectionReason.trim() : undefined,
      },
    });
  };

  const handleCallCandidate = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleEmailCandidate = (email?: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  const renderCandidateCard = ({ item }: { item: Application }) => {
    const candidateName = `${item.candidate?.firstName || ''} ${item.candidate?.lastName || ''}`.trim() || 'Candidate';
    const currentStageName = item.currentStage?.name || 'Sourced';

    return (
      <View style={styles.appCard}>
        <View style={styles.appCardTop}>
          <TouchableOpacity
            style={styles.candidateInfoRow}
            onPress={() =>
              navigation.navigate('CandidateDetail', { candidateId: item.candidateId })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.candidate?.firstName?.[0] || 'C'}
                {item.candidate?.lastName?.[0] || ''}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.nameText}>{candidateName}</Text>
              <Text style={styles.subText} numberOfLines={1}>
                {item.candidate?.currentTitle || 'Applicant'}{' '}
                {item.candidate?.currentCompany ? `@ ${item.candidate.currentCompany}` : ''}
              </Text>
            </View>
          </TouchableOpacity>

          {item.atsScore !== undefined ? <ScorePill score={item.atsScore} /> : null}
        </View>

        {/* Current Stage Indicator */}
        <View style={styles.stageIndicatorRow}>
          <View style={styles.stageChip}>
            <Ionicons name="git-commit-outline" size={12} color={COLORS.primary} />
            <Text style={styles.stageChipText}>{currentStageName}</Text>
          </View>

          <Text style={styles.appliedDateText}>
            {new Date(item.appliedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Quick Contact & Action Buttons */}
        <View style={styles.appCardFooter}>
          <View style={styles.contactIconsGroup}>
            {item.candidate?.phone ? (
              <TouchableOpacity
                style={styles.circleActionBtn}
                onPress={() => handleCallCandidate(item.candidate?.phone)}
              >
                <Ionicons name="call-outline" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            ) : null}

            {item.candidate?.email ? (
              <TouchableOpacity
                style={[styles.circleActionBtn, { marginLeft: 6 }]}
                onPress={() => handleEmailCandidate(item.candidate?.email)}
              >
                <Ionicons name="mail-outline" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.advanceButton}
            onPress={() => handleOpenTransitionModal(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.advanceButtonText}>Move Stage</Text>
            <Ionicons name="arrow-forward" size={12} color="#FFFFFF" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const selectedTargetStage = stages.find((s) => s.id === targetStageId);
  const isTargetReject =
    selectedTargetStage?.isRejected ||
    selectedTargetStage?.name?.toLowerCase().includes('reject') ||
    selectedTargetStage?.stageType?.toLowerCase().includes('reject');

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.navTitleGroup}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {jobTitle || 'Job Pipeline'}
          </Text>
          <Text style={styles.navSub}>Kanban Stages • {applications.length} Candidates</Text>
        </View>
      </View>

      {/* Stage Tab Filters */}
      <View style={styles.stageTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stageTabsScroll}>
          <TouchableOpacity
            style={[styles.stageTab, selectedStageId === null && styles.stageTabActive]}
            onPress={() => setSelectedStageId(null)}
          >
            <Text style={[styles.stageTabText, selectedStageId === null && styles.stageTabTextActive]}>
              All ({applications.length})
            </Text>
          </TouchableOpacity>

          {stages.map((stage) => {
            const count = applications.filter((a) => a.currentStageId === stage.id).length;
            const isSel = selectedStageId === stage.id;
            return (
              <TouchableOpacity
                key={stage.id}
                style={[styles.stageTab, isSel && styles.stageTabActive]}
                onPress={() => setSelectedStageId(stage.id)}
              >
                <Text style={[styles.stageTabText, isSel && styles.stageTabTextActive]}>
                  {stage.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Candidate Cards in Pipeline */}
      {loadingApps && !isRefetching ? (
        <LoadingSpinner message="Loading candidates..." />
      ) : (
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.id}
          renderItem={renderCandidateCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="git-network-outline"
              title="No candidates in this stage"
              description="Candidates will show up when assigned or moved to this stage."
            />
          }
        />
      )}

      {/* Stage Movement Modal */}
      <Modal
        visible={transitionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTransitionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Move Candidate</Text>
                <Text style={styles.modalSub}>
                  {selectedApplication?.candidate?.firstName} {selectedApplication?.candidate?.lastName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setTransitionModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionLabel}>Select Destination Stage</Text>
              <View style={styles.stagePickerCol}>
                {stages.map((stg) => {
                  const isChosen = targetStageId === stg.id;
                  return (
                    <TouchableOpacity
                      key={stg.id}
                      style={[styles.stagePickerOption, isChosen && styles.stagePickerOptionActive]}
                      onPress={() => setTargetStageId(stg.id)}
                    >
                      <Ionicons
                        name={isChosen ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={isChosen ? COLORS.primary : COLORS.textLight}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.stageOptionName, isChosen && styles.stageOptionNameActive]}>
                        {stg.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {isTargetReject && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.sectionLabel, { color: COLORS.error }]}>Rejection Reason *</Text>
                  <TextInput
                    style={[styles.modalInput, { height: 50, borderColor: '#FECACA' }]}
                    placeholder="e.g. Lacking required experience"
                    placeholderTextColor={COLORS.textLight}
                    multiline
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.sectionLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, { height: 60 }]}
                  placeholder="Add interview summary..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  value={transitionNotes}
                  onChangeText={setTransitionNotes}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setTransitionModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, updateStageMutation.isPending && styles.disabledBtn]}
                onPress={handleConfirmTransition}
                disabled={updateStageMutation.isPending}
              >
                {updateStageMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm Move</Text>
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
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    padding: 4,
    marginRight: 6,
  },
  navTitleGroup: {
    flex: 1,
  },
  navTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  navSub: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  stageTabsContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingVertical: 6,
  },
  stageTabsScroll: {
    paddingHorizontal: 16,
  },
  stageTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 6,
  },
  stageTabActive: {
    backgroundColor: COLORS.primary,
  },
  stageTabText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  stageTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  appCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  appCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  candidateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  metaCol: {
    flex: 1,
  },
  nameText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  stageIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.xs,
    marginBottom: 10,
  },
  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageChipText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 3,
  },
  appliedDateText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  appCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  contactIconsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  advanceButtonText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '500',
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
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 1,
  },
  modalScroll: {
    padding: 16,
  },
  sectionLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  stagePickerCol: {
    marginBottom: 12,
  },
  stagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
  },
  stagePickerOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  stageOptionName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  stageOptionNameActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 12,
  },
  modalInput: {
    fontFamily: FONTS.family,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: 8,
    fontSize: 12.5,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 8,
  },
  cancelBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  confirmBtn: {
    flex: 2,
    height: 42,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
