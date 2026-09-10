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
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Candidate } from '../../types/ats.types';

export const CandidatesListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const { data: candidates, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ats-candidates', search],
    queryFn: () => atsApi.getCandidates({ search }),
  });

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    }
  };

  const renderCandidate = ({ item }: { item: Candidate }) => {
    return (
      <TouchableOpacity
        style={styles.candidateCard}
        onPress={() => navigation.navigate('CandidateDetail', { candidateId: item.id })}
      >
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.firstName?.[0]}
              {item.lastName?.[0]}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.headline} numberOfLines={1}>
              {item.currentTitle || 'Candidate'} {item.currentCompany ? `at ${item.currentCompany}` : ''}
            </Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>

        {/* Skills preview */}
        {item.skills && item.skills.length > 0 ? (
          <View style={styles.skillsRow}>
            {item.skills.slice(0, 4).map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {item.skills.length > 4 ? (
              <Text style={styles.moreSkillsText}>+{item.skills.length - 4}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Card Footer with Quick Contact Actions */}
        <View style={styles.cardFooter}>
          <View style={styles.sourceTag}>
            <Ionicons name="pricetag-outline" size={12} color="#64748B" />
            <Text style={styles.sourceText}>{item.source || 'PORTAL'}</Text>
          </View>

          <View style={styles.actionButtons}>
            {item.phone ? (
              <>
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: '#ECFDF5' }]}
                  onPress={() => handleWhatsApp(item.phone)}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: '#EEF2FF', marginLeft: 8 }]}
                  onPress={() => handleCall(item.phone)}
                >
                  <Ionicons name="call" size={15} color="#4F46E5" />
                </TouchableOpacity>
              </>
            ) : null}

            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ marginLeft: 8 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Candidate Directory" subtitle="Talent pool and profiles" />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search candidates by name, email, or skill..."
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
      </View>

      {/* List */}
      {isLoading && !isRefetching ? (
        <LoadingSpinner message="Loading candidates..." />
      ) : (
        <FlatList
          data={candidates || []}
          keyExtractor={(item) => item.id}
          renderItem={renderCandidate}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#4F46E5']} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="people-outline"
              title="No candidates found"
              description="Candidates will show up when resumes are imported or applications are received."
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4F46E5',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headline: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  email: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
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
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
