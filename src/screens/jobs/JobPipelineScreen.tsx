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
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { ScorePill } from '../../components/ScorePill';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Application, PipelineStage } from '../../types/ats.types';

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

  // Fetch Stages
  const { data: stages, isLoading: stagesLoading } = useQuery({
    queryKey: ['job-stages', jobId],
    queryFn: () => atsApi.getJobStages(jobId),
  });

  // Fetch Applications for this job
  const { data: applications, isLoading: appsLoading, refetch } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => atsApi.getApplications({ jobId }),
  });

  // Mutation for Stage Transition
  const stageMutation = useMutation({
    mutationFn: ({ appId, stageId, notes }: { appId: string; stageId: string; notes?: string }) =>
      atsApi.updateApplicationStage(appId, { stageId, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      setTransitionModalVisible(false);
      setTransitionNotes('');
      Alert.alert('Stage Updated', 'Candidate successfully transitioned to new stage.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update candidate stage');
    },
  });

  const activeStages = stages || [];
  const currentStage = activeStages.find((s) => s.id === selectedStageId) || activeStages[0];
  const activeStageId = selectedStageId || activeStages[0]?.id;

  const stageApplications = (applications || []).filter(
    (app) => app.currentStageId === activeStageId,
  );

  const handleOpenTransition = (app: Application) => {
    setSelectedApplication(app);
    setTargetStageId(activeStages[0]?.id || '');
    setTransitionModalVisible(true);
  };

  const handleConfirmTransition = () => {
    if (!selectedApplication || !targetStageId) return;
    stageMutation.mutate({
      appId: selectedApplication.id,
      stageId: targetStageId,
      notes: transitionNotes,
    });
  };

  if (stagesLoading || appsLoading) {
    return <LoadingSpinner message="Loading recruitment pipeline..." />;
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.titleArea}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {jobTitle}
          </Text>
          <Text style={styles.subtext}>Pipeline Stages ({applications?.length || 0} Total)</Text>
        </View>
      </View>

      {/* Horizontal Stage Selector Tabs */}
      <View style={styles.stageTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stageTabsContent}>
          {activeStages.map((st) => {
            const count = (applications || []).filter((a) => a.currentStageId === st.id).length;
            const isSelected = st.id === activeStageId;

            return (
              <TouchableOpacity
                key={st.id}
                style={[styles.stageTab, isSelected && styles.activeStageTab]}
                onPress={() => setSelectedStageId(st.id)}
              >
                <Text style={[styles.stageTabText, isSelected && styles.activeStageTabText]}>
                  {st.name}
                </Text>
                <View style={[styles.badgeCount, isSelected && styles.activeBadgeCount]}>
                  <Text style={[styles.badgeCountText, isSelected && styles.activeBadgeCountText]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Candidates List in this stage */}
      <FlatList
        data={stageApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.candidateCard}>
            <View style={styles.cardHeader}>
              <View style={styles.infoArea}>
                <Text style={styles.candidateName}>
                  {item.candidate?.firstName} {item.candidate?.lastName}
                </Text>
                <Text style={styles.candidateEmail}>{item.candidate?.email}</Text>
                {item.candidate?.currentCompany ? (
                  <Text style={styles.candidateCompany}>
                    {item.candidate?.currentTitle || 'Engineer'} at {item.candidate.currentCompany}
                  </Text>
                ) : null}
              </View>
              <ScorePill score={item.atsScore} />
            </View>

            {/* Candidate Skills Pills */}
            {item.candidate?.skills && item.candidate.skills.length > 0 ? (
              <View style={styles.skillsRow}>
                {item.candidate.skills.slice(0, 4).map((skill, idx) => (
                  <View key={idx} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {item.candidate.skills.length > 4 ? (
                  <Text style={styles.moreSkillsText}>+{item.candidate.skills.length - 4}</Text>
                ) : null}
              </View>
            ) : null}

            {/* Action Bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() =>
                  navigation.navigate('CandidatesTab', {
                    screen: 'CandidateDetail',
                    params: { candidateId: item.candidateId },
                  })
                }
              >
                <Ionicons name="person-outline" size={14} color="#4F46E5" />
                <Text style={styles.detailButtonText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moveButton}
                onPress={() => handleOpenTransition(item)}
              >
                <Ionicons name="arrow-forward-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.moveButtonText}>Move Stage</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            iconName="people-outline"
            title={`No candidates in ${currentStage?.name || 'this stage'}`}
            description="Advance candidates from earlier stages or check other pipeline columns."
          />
        }
      />

      {/* Stage Transition Modal */}
      <Modal visible={transitionModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move Candidate Stage</Text>
            <Text style={styles.modalSubtitle}>
              Select new stage for {selectedApplication?.candidate?.firstName}{' '}
              {selectedApplication?.candidate?.lastName}
            </Text>

            {/* Stage Options */}
            <Text style={styles.inputLabel}>Target Stage</Text>
            <View style={styles.modalStageList}>
              {activeStages.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={[
                    styles.modalStageOption,
                    targetStageId === st.id && styles.activeModalStageOption,
                  ]}
                  onPress={() => setTargetStageId(st.id)}
                >
                  <Text
                    style={[
                      styles.modalStageOptionText,
                      targetStageId === st.id && styles.activeModalStageOptionText,
                    ]}
                  >
                    {st.name}
                  </Text>
                  {targetStageId === st.id ? (
                    <Ionicons name="checkmark-circle" size={18} color="#4F46E5" />
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.inputLabel}>Stage Change Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Cleared round 1 technical screen with high marks"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={transitionNotes}
              onChangeText={setTransitionNotes}
            />

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setTransitionModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmModalButton, stageMutation.isPending && { opacity: 0.6 }]}
                onPress={handleConfirmTransition}
                disabled={stageMutation.isPending}
              >
                {stageMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmModalText}>Confirm Transition</Text>
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
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  titleArea: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  stageTabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stageTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stageTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeStageTab: {
    backgroundColor: '#4F46E5',
  },
  stageTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  activeStageTabText: {
    color: '#FFFFFF',
  },
  badgeCount: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  activeBadgeCount: {
    backgroundColor: '#3730A3',
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  activeBadgeCountText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  candidateCard: {
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
    marginBottom: 10,
  },
  infoArea: {
    flex: 1,
    marginRight: 8,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  candidateEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  candidateCompany: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
    fontWeight: '500',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  moreSkillsText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    alignSelf: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  detailButtonText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
    marginLeft: 4,
  },
  moveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  moveButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  modalStageList: {
    marginBottom: 16,
  },
  modalStageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  activeModalStageOption: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  modalStageOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  activeModalStageOptionText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 70,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelModalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  confirmModalButton: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  confirmModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
