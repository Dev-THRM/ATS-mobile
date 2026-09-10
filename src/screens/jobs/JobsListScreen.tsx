import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
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
import { Job, EmploymentType, JobStatus } from '../../types/ats.types';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

const STATUS_FILTERS: Array<{ label: string; value: 'ALL' | JobStatus }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'OPEN' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Closed', value: 'CLOSED' },
];

const EMPLOYMENT_TYPES: Array<{ label: string; value: EmploymentType }> = [
  { label: 'Full Time', value: 'FULL_TIME' },
  { label: 'Part Time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
];

export const JobsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');

  // Create Job Modal State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Senior Level');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');

  const { data: jobsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ats-jobs'],
    queryFn: () => atsApi.getJobs(),
  });

  const jobsList: Job[] = Array.isArray(jobsData)
    ? jobsData
    : (jobsData as any)?.data || (jobsData as any)?.jobs || [];

  const filteredJobs = jobsList.filter((job) => {
    const matchesSearch =
      (job.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (job.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const createJobMutation = useMutation({
    mutationFn: atsApi.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ats-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      setCreateModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Job opening published successfully!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create job opening';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setLocation('');
    setEmploymentType('FULL_TIME');
    setExperienceLevel('Mid-Senior Level');
    setSalaryMin('');
    setSalaryMax('');
    setDescription('');
  };

  const handleCreateSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a job title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please provide a job description');
      return;
    }

    createJobMutation.mutate({
      title: title.trim(),
      department: department.trim() || undefined,
      location: location.trim() || 'Remote',
      employmentType,
      experienceLevel,
      salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
      salaryCurrency: 'INR',
      description: description.trim(),
    });
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'OPEN':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', label: 'Active' };
      case 'DRAFT':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', label: 'Draft' };
      case 'CLOSED':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Closed' };
      case 'ON_HOLD':
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', label: 'On Hold' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', label: status };
    }
  };

  const formatSalary = (min?: number, max?: number, curr = '₹') => {
    if (!min && !max) return null;
    const formatValue = (val: number) => {
      if (val >= 100000) {
        const lpa = (val / 100000).toFixed(1).replace(/\.0$/, '');
        return `₹${lpa} LPA`;
      }
      return `₹${(val / 1000).toFixed(0)}k`;
    };

    if (min && max) return `${formatValue(min)} - ${formatValue(max)}`;
    if (min) return `From ${formatValue(min)}`;
    return `Up to ${formatValue(max!)}`;
  };

  const renderJobCard = ({ item }: { item: Job }) => {
    const statusStyle = getStatusBadge(item.status);
    const applicantCount = item._count?.applications || 0;
    const salaryStr = formatSalary(item.salaryMin, item.salaryMax, item.salaryCurrency === 'USD' ? '$' : '₹');

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => navigation.navigate('JobPipeline', { jobId: item.id, jobTitle: item.title })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleArea}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.subMetaRow}>
              {item.department ? (
                <Text style={styles.deptText}>{item.department}</Text>
              ) : null}
              {item.department && item.location ? <Text style={styles.dotSeparator}>•</Text> : null}
              <Text style={styles.locText}>{item.location || 'Remote'}</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
            ]}
          >
            <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        {/* Tag row */}
        <View style={styles.tagsRow}>
          <View style={styles.tagPill}>
            <Ionicons name="briefcase-outline" size={11} color={COLORS.textSecondary} />
            <Text style={styles.tagText}>{item.employmentType?.replace('_', ' ') || 'Full Time'}</Text>
          </View>

          {item.experienceLevel ? (
            <View style={styles.tagPill}>
              <Ionicons name="speedometer-outline" size={11} color={COLORS.textSecondary} />
              <Text style={styles.tagText}>{item.experienceLevel}</Text>
            </View>
          ) : null}

          {salaryStr ? (
            <View style={[styles.tagPill, styles.salaryPill]}>
              <Ionicons name="cash-outline" size={11} color={COLORS.success} />
              <Text style={[styles.tagText, { color: COLORS.success, fontWeight: '500' }]}>{salaryStr}</Text>
            </View>
          ) : null}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.pipelineInfo}>
            <View style={styles.applicantBadge}>
              <Ionicons name="people-outline" size={12} color={COLORS.primary} />
              <Text style={styles.applicantCountText}>{applicantCount} applicants</Text>
            </View>
          </View>

          <View style={styles.openPipelineBtn}>
            <Text style={styles.openPipelineText}>Open Pipeline</Text>
            <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Open Positions"
        subtitle={`${jobsList.length} Requisitions`}
      />

      {/* Search & Actions Bar */}
      <View style={styles.topControlSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={16} color={COLORS.textLight} style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search title, department, location..."
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

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Post Job</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((f) => {
            const isSel = statusFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[styles.filterChip, isSel && styles.filterChipActive]}
                onPress={() => setStatusFilter(f.value)}
              >
                <Text style={[styles.filterChipText, isSel && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Jobs List */}
      {isLoading && !isRefetching ? (
        <LoadingSpinner message="Fetching job openings..." />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="briefcase-outline"
              title="No open positions found"
              description="Create a new job posting to begin receiving candidates."
            />
          }
        />
      )}

      {/* Create Job Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Post New Position</Text>
                <Text style={styles.modalSub}>Launch a requisition across your organization</Text>
              </View>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Title *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Senior Fullstack Engineer"
                  placeholderTextColor={COLORS.textLight}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Department</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Engineering"
                    placeholderTextColor={COLORS.textLight}
                    value={department}
                    onChangeText={setDepartment}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Remote / San Francisco"
                    placeholderTextColor={COLORS.textLight}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Employment Type</Text>
                <View style={styles.typeChipsRow}>
                  {EMPLOYMENT_TYPES.map((t) => {
                    const isSel = employmentType === t.value;
                    return (
                      <TouchableOpacity
                        key={t.value}
                        style={[styles.typeChip, isSel && styles.typeChipActive]}
                        onPress={() => setEmploymentType(t.value)}
                      >
                        <Text style={[styles.typeChipText, isSel && styles.typeChipTextActive]}>
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Min Salary (₹ / yr)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 600000 (6 LPA)"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="numeric"
                    value={salaryMin}
                    onChangeText={setSalaryMin}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Max Salary (₹ / yr)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 1500000 (15 LPA)"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="numeric"
                    value={salaryMax}
                    onChangeText={setSalaryMax}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Description & Requirements *</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  placeholder="Outline responsibilities, tech stack, and qualifications..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, createJobMutation.isPending && styles.disabledButton]}
                onPress={handleCreateSubmit}
                disabled={createJobMutation.isPending}
              >
                {createJobMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Publish Requisition</Text>
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
  topControlSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: RADIUS.sm,
  },
  createButtonText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12.5,
    marginLeft: 3,
  },
  filterScroll: {
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceSecondary,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  jobCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleArea: {
    flex: 1,
    marginRight: 6,
  },
  jobTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deptText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.primary,
    fontWeight: '500',
  },
  dotSeparator: {
    marginHorizontal: 4,
    color: COLORS.textLight,
  },
  locText: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusPillText: {
    fontFamily: FONTS.family,
    fontSize: 9.5,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    marginRight: 5,
    marginBottom: 4,
  },
  salaryPill: {
    backgroundColor: COLORS.successLight,
  },
  tagText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  pipelineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  applicantCountText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 3,
  },
  openPipelineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openPipelineText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginRight: 2,
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
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
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
