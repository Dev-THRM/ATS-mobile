import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { ScorePill } from '../../components/ScorePill';
import { StageBadge } from '../../components/StageBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const CandidateDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { candidateId } = route.params;

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate-detail', candidateId],
    queryFn: () => atsApi.getCandidateById(candidateId),
  });

  if (isLoading || !candidate) {
    return <LoadingSpinner message="Loading candidate profile..." />;
  }

  const handleCall = () => {
    if (candidate.phone) {
      Linking.openURL(`tel:${candidate.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (candidate.phone) {
      const cleanPhone = candidate.phone.replace(/[^\d+]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    }
  };

  const handleEmail = () => {
    if (candidate.email) {
      Linking.openURL(`mailto:${candidate.email}`);
    }
  };

  const handleOpenLink = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Candidate Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {candidate.firstName?.[0]}
              {candidate.lastName?.[0]}
            </Text>
          </View>
          <Text style={styles.name}>
            {candidate.firstName} {candidate.lastName}
          </Text>
          <Text style={styles.role}>
            {candidate.currentTitle || 'Candidate'}{' '}
            {candidate.currentCompany ? `at ${candidate.currentCompany}` : ''}
          </Text>
          {candidate.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <Text style={styles.locationText}>{candidate.location}</Text>
            </View>
          ) : null}

          {/* Quick Contact Action Row */}
          <View style={styles.contactRow}>
            {candidate.phone ? (
              <>
                <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#ECFDF5' }]} onPress={handleWhatsApp}>
                  <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
                  <Text style={[styles.contactButtonText, { color: '#16A34A' }]}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#EEF2FF' }]} onPress={handleCall}>
                  <Ionicons name="call-outline" size={18} color="#4F46E5" />
                  <Text style={[styles.contactButtonText, { color: '#4F46E5' }]}>Call</Text>
                </TouchableOpacity>
              </>
            ) : null}

            <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#F1F5F9' }]} onPress={handleEmail}>
              <Ionicons name="mail-outline" size={18} color="#475569" />
              <Text style={[styles.contactButtonText, { color: '#475569' }]}>Email</Text>
            </TouchableOpacity>
          </View>

          {/* External Links */}
          {(candidate.linkedinUrl || candidate.githubUrl || candidate.portfolioUrl) && (
            <View style={styles.linksRow}>
              {candidate.linkedinUrl && (
                <TouchableOpacity style={styles.linkPill} onPress={() => handleOpenLink(candidate.linkedinUrl)}>
                  <Ionicons name="logo-linkedin" size={14} color="#0A66C2" />
                  <Text style={styles.linkPillText}>LinkedIn</Text>
                </TouchableOpacity>
              )}
              {candidate.githubUrl && (
                <TouchableOpacity style={styles.linkPill} onPress={() => handleOpenLink(candidate.githubUrl)}>
                  <Ionicons name="logo-github" size={14} color="#0F172A" />
                  <Text style={styles.linkPillText}>GitHub</Text>
                </TouchableOpacity>
              )}
              {candidate.portfolioUrl && (
                <TouchableOpacity style={styles.linkPill} onPress={() => handleOpenLink(candidate.portfolioUrl)}>
                  <Ionicons name="globe-outline" size={14} color="#059669" />
                  <Text style={styles.linkPillText}>Portfolio</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Skills Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Skills & Competencies</Text>
          {candidate.skills && candidate.skills.length > 0 ? (
            <View style={styles.skillsCloud}>
              {candidate.skills.map((sk, idx) => (
                <View key={idx} style={styles.skillBadge}>
                  <Text style={styles.skillBadgeText}>{sk}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No skills listed.</Text>
          )}
        </View>

        {/* Applications History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Job Applications</Text>
          {candidate.applications && candidate.applications.length > 0 ? (
            candidate.applications.map((app) => (
              <View key={app.id} style={styles.appCard}>
                <View style={styles.appCardHeader}>
                  <Text style={styles.appJobTitle}>{app.job?.title || 'Job Application'}</Text>
                  <ScorePill score={app.atsScore} />
                </View>
                <View style={styles.appCardFooter}>
                  <StageBadge stageName={app.currentStage?.name || 'Applied'} />
                  <Text style={styles.appDate}>
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No active applications.</Text>
          )}
        </View>
      </ScrollView>
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
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  role: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    width: '100%',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    width: '100%',
  },
  linkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 4,
  },
  linkPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  skillsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  skillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  appCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  appJobTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  appCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
