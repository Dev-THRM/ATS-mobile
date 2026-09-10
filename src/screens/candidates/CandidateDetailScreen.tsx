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
import { Application, Candidate } from '../../types/ats.types';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

export const CandidateDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { candidateId } = route.params;

  const { data: candidate, isLoading, refetch, isRefetching } = useQuery<Candidate>({
    queryKey: ['candidate-detail', candidateId],
    queryFn: () => atsApi.getCandidateById(candidateId),
  });

  if (isLoading && !isRefetching) {
    return <LoadingSpinner message="Retrieving candidate profile..." />;
  }

  if (!candidate) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Candidate Not Found</Text>
        </View>
      </View>
    );
  }

  const handleCall = () => {
    if (candidate.phone) Linking.openURL(`tel:${candidate.phone}`);
  };

  const handleWhatsApp = () => {
    if (candidate.phone) {
      const cleanPhone = candidate.phone.replace(/[^\d+]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    }
  };

  const handleEmail = () => {
    if (candidate.email) Linking.openURL(`mailto:${candidate.email}`);
  };

  const handleOpenLink = (url?: string) => {
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(fullUrl);
    }
  };

  const applicationsList: Application[] = Array.isArray(candidate.applications)
    ? candidate.applications
    : (candidate as any)?.applications?.data || [];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Candidate Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            {candidate.currentCompany ? `@ ${candidate.currentCompany}` : ''}
          </Text>
          {candidate.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
              <Text style={styles.locationText}>{candidate.location}</Text>
            </View>
          ) : null}

          {/* Contact Row */}
          <View style={styles.contactRow}>
            {candidate.phone ? (
              <>
                <TouchableOpacity
                  style={[styles.contactButton, { backgroundColor: '#ECFDF5' }]}
                  onPress={handleWhatsApp}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#16A34A" />
                  <Text style={[styles.contactButtonText, { color: '#16A34A' }]}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.contactButton, { backgroundColor: COLORS.primaryLight }]}
                  onPress={handleCall}
                >
                  <Ionicons name="call-outline" size={15} color={COLORS.primary} />
                  <Text style={[styles.contactButtonText, { color: COLORS.primary }]}>Call</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {candidate.email ? (
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: COLORS.surfaceSecondary }]}
                onPress={handleEmail}
              >
                <Ionicons name="mail-outline" size={15} color={COLORS.textSecondary} />
                <Text style={[styles.contactButtonText, { color: COLORS.textSecondary }]}>Email</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Links Row */}
          {(candidate.linkedinUrl || candidate.resumeUrl || candidate.portfolioUrl || candidate.githubUrl) ? (
            <View style={styles.linksRow}>
              {candidate.linkedinUrl ? (
                <TouchableOpacity
                  style={styles.linkPill}
                  onPress={() => handleOpenLink(candidate.linkedinUrl)}
                >
                  <Ionicons name="logo-linkedin" size={13} color="#0A66C2" />
                  <Text style={styles.linkPillText}>LinkedIn</Text>
                </TouchableOpacity>
              ) : null}

              {candidate.resumeUrl ? (
                <TouchableOpacity
                  style={[styles.linkPill, { backgroundColor: COLORS.primaryLight }]}
                  onPress={() => handleOpenLink(candidate.resumeUrl)}
                >
                  <Ionicons name="document-text-outline" size={13} color={COLORS.primary} />
                  <Text style={[styles.linkPillText, { color: COLORS.primary }]}>Resume</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Skills Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Key Skills</Text>
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
          <Text style={styles.sectionTitle}>Applications ({applicationsList.length})</Text>
          {applicationsList.length > 0 ? (
            applicationsList.map((app) => (
              <View key={app.id} style={styles.appCard}>
                <View style={styles.appCardHeader}>
                  <Text style={styles.appJobTitle}>{app.job?.title || 'Position'}</Text>
                  {app.atsScore !== undefined ? <ScorePill score={app.atsScore} /> : null}
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
            <Text style={styles.emptyText}>No applications found.</Text>
          )}
        </View>
      </ScrollView>
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
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  topBarTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  name: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  role: {
    fontFamily: FONTS.family,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    width: '100%',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    marginHorizontal: 3,
  },
  contactButtonText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
    width: '100%',
  },
  linkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 3,
    marginBottom: 4,
  },
  linkPillText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginLeft: 3,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  skillsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.primary,
  },
  emptyText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  appCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: 8,
  },
  appCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  appJobTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  appCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appDate: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
});
