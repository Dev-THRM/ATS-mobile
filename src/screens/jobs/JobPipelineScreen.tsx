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
  Switch,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScorePill } from '../../components/ScorePill';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Application, Candidate, PipelineStage } from '../../types/ats.types';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

export const JobPipelineScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { jobId, jobTitle } = route.params;
  const queryClient = useQueryClient();

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 47 : 14) + 6;

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Stage Transition Modal State
  const [transitionModalVisible, setTransitionModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [targetStageId, setTargetStageId] = useState<string>('');
  const [transitionNotes, setTransitionNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [sendEmail, setSendEmail] = useState<boolean>(true);
  const [joiningDate, setJoiningDate] = useState<string>('');
  const [joiningDateError, setJoiningDateError] = useState<string | null>(null);

  // Add Candidate to Pipeline Modal State
  const [addCandidateModalVisible, setAddCandidateModalVisible] = useState(false);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [selectedCandidateToAdd, setSelectedCandidateToAdd] = useState<Candidate | null>(null);
  const [initialStageIdForAdd, setInitialStageIdForAdd] = useState<string>('');

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

  // Query talent pool for Add Candidate modal
  const { data: talentPoolData, isLoading: loadingTalentPool } = useQuery({
    queryKey: ['ats-talent-pool-search', candidateSearchQuery],
    queryFn: () => atsApi.getCandidates({ search: candidateSearchQuery }),
    enabled: addCandidateModalVisible,
  });

  const stages: PipelineStage[] = Array.isArray(stagesData)
    ? stagesData
    : (stagesData as any)?.stages || (stagesData as any)?.data || [];

  const applications: Application[] = Array.isArray(applicationsData)
    ? applicationsData
    : (applicationsData as any)?.applications || (applicationsData as any)?.data || [];

  const talentPoolCandidates: Candidate[] = Array.isArray(talentPoolData)
    ? talentPoolData
    : (talentPoolData as any)?.data || (talentPoolData as any)?.candidates || [];

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
      payload: {
        stageId: string;
        toStageId?: string;
        notes?: string;
        customNotes?: string;
        rejectionReason?: string;
        sendEmail?: boolean;
        joiningDate?: string;
      };
    }) => atsApi.updateApplicationStage(appId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      setTransitionModalVisible(false);
      setSelectedApplication(null);
      setTransitionNotes('');
      setRejectionReason('');
      setJoiningDate('');
      setJoiningDateError(null);
      Alert.alert('Success', 'Candidate stage updated.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to move stage.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const removeCandidateMutation = useMutation({
    mutationFn: (appId: string) => atsApi.deleteApplication(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      Alert.alert('Success', 'Candidate removed from this pipeline.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to remove candidate.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const addCandidateMutation = useMutation({
    mutationFn: ({ candidateId, stageId }: { candidateId: string; stageId?: string }) =>
      atsApi.createApplication({
        jobId,
        candidateId,
        stageId: stageId || stages[0]?.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      setAddCandidateModalVisible(false);
      setSelectedCandidateToAdd(null);
      setCandidateSearchQuery('');
      Alert.alert('Success', 'Candidate assigned to this job pipeline!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to add candidate.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const handleOpenTransitionModal = (app: Application) => {
    setSelectedApplication(app);
    setTargetStageId(app.currentStageId || (stages[0]?.id ?? ''));
    setTransitionNotes('');
    setRejectionReason('');
    setSendEmail(!!app.candidate?.email);

    // Default expected date of joining to 15 days ahead
    const defaultDate = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    setJoiningDate(defaultDate);
    setJoiningDateError(null);
    setTransitionModalVisible(true);
  };

  const handleConfirmTransition = () => {
    if (!selectedApplication || !targetStageId) return;

    const chosenStage = stages.find((s) => s.id === targetStageId);
    const isRejectStage =
      chosenStage?.isRejected ||
      chosenStage?.name?.toLowerCase().includes('reject') ||
      chosenStage?.stageType?.toLowerCase().includes('reject');

    const isOfferStage =
      chosenStage?.stageType === 'OFFER' ||
      chosenStage?.stageType === 'HIRED' ||
      chosenStage?.name?.toLowerCase().includes('offer') ||
      chosenStage?.name?.toLowerCase().includes('hire');

    if (isRejectStage && !rejectionReason.trim()) {
      Alert.alert('Reason Required', 'Please document why candidate was rejected.');
      return;
    }

    if (isOfferStage && !joiningDate.trim()) {
      setJoiningDateError('Expected date of joining is required for an offer.');
      Alert.alert('Joining Date Required', 'Please specify the candidate’s expected date of joining.');
      return;
    }

    setJoiningDateError(null);

    updateStageMutation.mutate({
      appId: selectedApplication.id,
      payload: {
        stageId: targetStageId,
        toStageId: targetStageId,
        notes: transitionNotes.trim() || undefined,
        customNotes: transitionNotes.trim() || undefined,
        rejectionReason: isRejectStage ? rejectionReason.trim() : undefined,
        sendEmail: selectedApplication.candidate?.email ? sendEmail : false,
        joiningDate: isOfferStage && joiningDate.trim() ? joiningDate.trim() : undefined,
      },
    });
  };

  const handleRemoveCandidate = (app: Application) => {
    const candidateName =
      `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.trim() || 'Candidate';
    Alert.alert(
      'Remove Candidate',
      `Are you sure you want to remove ${candidateName} from this job pipeline?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeCandidateMutation.mutate(app.id),
        },
      ],
    );
  };

  const handleCallCandidate = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleEmailCandidate = (email?: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  const renderCandidateCard = ({ item }: { item: Application }) => {
    const candidateName =
      `${item.candidate?.firstName || ''} ${item.candidate?.lastName || ''}`.trim() || 'Candidate';
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

            {/* Remove Candidate Button */}
            <TouchableOpacity
              style={[styles.circleActionBtn, styles.deleteActionBtn, { marginLeft: 6 }]}
              onPress={() => handleRemoveCandidate(item)}
            >
              <Ionicons name="trash-outline" size={14} color={COLORS.error} />
            </TouchableOpacity>
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

  const isTargetOfferOrHired =
    selectedTargetStage?.stageType === 'OFFER' ||
    selectedTargetStage?.stageType === 'HIRED' ||
    selectedTargetStage?.name?.toLowerCase().includes('offer') ||
    selectedTargetStage?.name?.toLowerCase().includes('hire');

  return (
    <View style={styles.container}>
      {/* Top Header with Add Candidate Action */}
      <View style={[styles.navHeader, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.navTitleGroup}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {jobTitle || 'Job Pipeline'}
          </Text>
          <Text style={styles.navSub}>Kanban Stages • {applications.length} Candidates</Text>
        </View>

        {/* Add Candidate Button */}
        <TouchableOpacity
          style={styles.addCandidateHeaderBtn}
          onPress={() => {
            setCandidateSearchQuery('');
            setSelectedCandidateToAdd(null);
            setInitialStageIdForAdd(stages[0]?.id || '');
            setAddCandidateModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={14} color="#FFFFFF" />
          <Text style={styles.addCandidateHeaderBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Stage Tab Filters */}
      <View style={styles.stageTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stageTabsScroll}
        >
          <TouchableOpacity
            style={[styles.stageTab, selectedStageId === null && styles.stageTabActive]}
            onPress={() => setSelectedStageId(null)}
          >
            <Text
              style={[styles.stageTabText, selectedStageId === null && styles.stageTabTextActive]}
            >
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
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[COLORS.primary]}
            />
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
                  {selectedApplication?.candidate?.firstName}{' '}
                  {selectedApplication?.candidate?.lastName}
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
                      <Text
                        style={[
                          styles.stageOptionName,
                          isChosen && styles.stageOptionNameActive,
                        ]}
                      >
                        {stg.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Offer Stage: Expected Date of Joining Prompt */}
              {isTargetOfferOrHired && (
                <View style={styles.offerPromptCard}>
                  <View style={styles.offerPromptHeader}>
                    <Ionicons name="calendar" size={16} color="#059669" />
                    <Text style={styles.offerPromptTitle}>
                      Expected Date of Joining <Text style={{ color: COLORS.error }}>*</Text>
                    </Text>
                  </View>
                  <Text style={styles.offerPromptDesc}>
                    Specify the candidate’s start date. This will be sent directly in their formal offer letter.
                  </Text>

                  <TextInput
                    style={[
                      styles.modalInput,
                      styles.dateInput,
                      joiningDateError ? { borderColor: COLORS.error } : null,
                    ]}
                    placeholder="YYYY-MM-DD (e.g. 2026-10-06)"
                    placeholderTextColor={COLORS.textLight}
                    value={joiningDate}
                    onChangeText={(val) => {
                      setJoiningDate(val);
                      setJoiningDateError(null);
                    }}
                  />

                  {/* Quick Preset Buttons */}
                  <View style={styles.presetsRow}>
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() =>
                        setJoiningDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])
                      }
                    >
                      <Text style={styles.presetChipText}>+7 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() =>
                        setJoiningDate(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0])
                      }
                    >
                      <Text style={styles.presetChipText}>+15 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() =>
                        setJoiningDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
                      }
                    >
                      <Text style={styles.presetChipText}>+30 Days</Text>
                    </TouchableOpacity>
                  </View>

                  {joiningDateError && (
                    <Text style={styles.errorText}>{joiningDateError}</Text>
                  )}
                </View>
              )}

              {/* Rejection Reason Prompt */}
              {isTargetReject && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.sectionLabel, { color: COLORS.error }]}>
                    Rejection Reason *
                  </Text>
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

              {/* Email Notification Switch Card */}
              {selectedApplication?.candidate?.email && (
                <View style={styles.switchCard}>
                  <View style={styles.switchCardTextCol}>
                    <Text style={styles.switchCardTitle}>Send Email Notification</Text>
                    <Text style={styles.switchCardSubtitle}>
                      Candidate will receive an email update regarding their progression.
                    </Text>
                  </View>
                  <Switch
                    value={sendEmail}
                    onValueChange={setSendEmail}
                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              )}

              {/* Recruiter Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.sectionLabel}>Notes / Remarks (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, { height: 60 }]}
                  placeholder="Add status notes or special candidate remarks..."
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

      {/* Add Candidate to Pipeline Modal */}
      <Modal
        visible={addCandidateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddCandidateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Candidate to Pipeline</Text>
                <Text style={styles.modalSub}>{jobTitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setAddCandidateModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.addModalBody}>
              {/* Search Candidates Input */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color={COLORS.textLight} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name, skill, or email..."
                  placeholderTextColor={COLORS.textLight}
                  value={candidateSearchQuery}
                  onChangeText={setCandidateSearchQuery}
                />
                {candidateSearchQuery ? (
                  <TouchableOpacity onPress={() => setCandidateSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textLight} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Initial Stage Selector */}
              <View style={styles.initialStageRow}>
                <Text style={styles.initialStageLabel}>Initial Stage:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {stages.map((stg) => {
                    const isSelected = (initialStageIdForAdd || stages[0]?.id) === stg.id;
                    return (
                      <TouchableOpacity
                        key={stg.id}
                        style={[styles.smallStageChip, isSelected && styles.smallStageChipActive]}
                        onPress={() => setInitialStageIdForAdd(stg.id)}
                      >
                        <Text
                          style={[
                            styles.smallStageChipText,
                            isSelected && styles.smallStageChipTextActive,
                          ]}
                        >
                          {stg.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Talent Pool Candidates List */}
              {loadingTalentPool ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
              ) : (
                <FlatList
                  data={talentPoolCandidates}
                  keyExtractor={(cand) => cand.id}
                  style={{ maxHeight: 280 }}
                  renderItem={({ item }) => {
                    const isSelected = selectedCandidateToAdd?.id === item.id;
                    const alreadyInPipeline = applications.some((a) => a.candidateId === item.id);
                    const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Candidate';

                    return (
                      <TouchableOpacity
                        style={[
                          styles.candidatePickRow,
                          isSelected && styles.candidatePickRowActive,
                          alreadyInPipeline && { opacity: 0.5 },
                        ]}
                        disabled={alreadyInPipeline}
                        onPress={() => setSelectedCandidateToAdd(item)}
                      >
                        <View style={styles.candidatePickAvatar}>
                          <Text style={styles.candidatePickAvatarText}>
                            {item.firstName?.[0] || 'C'}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={styles.candidatePickName}>{fullName}</Text>
                          <Text style={styles.candidatePickSub} numberOfLines={1}>
                            {item.currentTitle || 'Applicant'} • {item.email || 'No email'}
                          </Text>
                        </View>
                        {alreadyInPipeline ? (
                          <Text style={styles.alreadyBadge}>In Pipeline</Text>
                        ) : (
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                            size={20}
                            color={isSelected ? COLORS.primary : COLORS.textLight}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <Text style={styles.emptyPoolText}>
                      No candidates found matching query.
                    </Text>
                  }
                />
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAddCandidateModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  (!selectedCandidateToAdd || addCandidateMutation.isPending) && styles.disabledBtn,
                ]}
                disabled={!selectedCandidateToAdd || addCandidateMutation.isPending}
                onPress={() => {
                  if (selectedCandidateToAdd) {
                    addCandidateMutation.mutate({
                      candidateId: selectedCandidateToAdd.id,
                      stageId: initialStageIdForAdd || stages[0]?.id,
                    });
                  }
                }}
              >
                {addCandidateMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Add Candidate</Text>
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
  addCandidateHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  addCandidateHeaderBtnText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  deleteActionBtn: {
    backgroundColor: '#FEE2E2',
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
  offerPromptCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 14,
  },
  offerPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  offerPromptTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#065F46',
  },
  offerPromptDesc: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#047857',
    lineHeight: 15,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#6EE7B7',
    fontWeight: '600',
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  presetChipText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#065F46',
  },
  errorText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
  },
  switchCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 12,
  },
  switchCardTextCol: {
    flex: 1,
    marginRight: 10,
  },
  switchCardTitle: {
    fontFamily: FONTS.family,
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  switchCardSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
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
  addModalBody: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 38,
    fontFamily: FONTS.family,
    fontSize: 12.5,
    color: COLORS.textPrimary,
  },
  initialStageRow: {
    marginBottom: 10,
  },
  initialStageLabel: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  smallStageChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  smallStageChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  smallStageChipText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  smallStageChipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  candidatePickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6,
    backgroundColor: COLORS.surface,
  },
  candidatePickRowActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  candidatePickAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  candidatePickAvatarText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  candidatePickName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  candidatePickSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  alreadyBadge: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: COLORS.textMuted,
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  emptyPoolText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 16,
  },
});
