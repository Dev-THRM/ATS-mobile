import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Job } from '../../types/ats.types';

export const JobsListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'DRAFT' | 'CLOSED'>('ALL');

  const { data: jobs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ats-jobs'],
    queryFn: () => atsApi.getJobs(),
  });

  const filteredJobs = (jobs || []).filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.department || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderJobItem = ({ item }: { item: Job }) => {
    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'OPEN':
          return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
        case 'DRAFT':
          return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
        case 'CLOSED':
          return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
        default:
          return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      }
    };

    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => navigation.navigate('JobPipeline', { jobId: item.id, jobTitle: item.title })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleArea}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobMeta}>
              {item.department || 'General'} • {item.location || 'Remote'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={15} color="#64748B" />
            <Text style={styles.statText}>
              {item._count?.applications || 0} Candidates
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="git-branch-outline" size={15} color="#64748B" />
            <Text style={styles.statText}>
              {item.pipelineStages?.length || 6} Stages
            </Text>
          </View>

          <View style={styles.pipelineArrow}>
            <Text style={styles.viewPipelineText}>Pipeline</Text>
            <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Positions & Pipelines" subtitle="Manage open roles and candidates" />

      {/* Search & Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search job titles or departments..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Chips */}
        <View style={styles.chipRow}>
          {(['ALL', 'OPEN', 'DRAFT', 'CLOSED'] as const).map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, statusFilter === st && styles.activeChip]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.chipText, statusFilter === st && styles.activeChipText]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Jobs List */}
      {isLoading && !isRefetching ? (
        <LoadingSpinner message="Loading positions..." />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderJobItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#4F46E5']} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="briefcase-outline"
              title="No jobs found"
              description="No open positions match your search query."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#4F46E5',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  jobCard: {
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
  titleArea: {
    flex: 1,
    marginRight: 10,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  jobMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 5,
    fontWeight: '500',
  },
  pipelineArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewPipelineText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
    marginRight: 2,
  },
});
