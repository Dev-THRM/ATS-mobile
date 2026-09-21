import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { atsApi } from '../../api/ats.api';
import { ScorePill } from '../../components/ScorePill';
import { StageBadge } from '../../components/StageBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Application, Candidate } from '../../types/ats.types';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';
import { API_BASE_URL } from '../../api/client';

const formatCandidateName = (first?: string, last?: string) => {
  let full = `${first || ''} ${last || ''}`.trim();
  // Strip "sample resume" prefix if present
  full = full.replace(/^sample\s*(resume)?\s*[-_:]?\s*/i, '').trim();
  if (!full) return 'Candidate Profile';
  return full
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'CP';
};

const getResumeUri = (url?: string) => {
  if (!url) return null;
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    try {
      const fileIdMatch =
        url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
        url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/) ||
        url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
        url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
      return url.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
    } catch {
      return url;
    }
  }

  if (url.startsWith('http')) return url;
  const serverRoot = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${serverRoot}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const CandidateDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { candidateId } = route.params;
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RESUME' | 'APPLICATIONS'>('OVERVIEW');

  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 47 : 14) + 6;

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
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Candidate Not Found</Text>
        </View>
      </View>
    );
  }

  const applicationsList: Application[] = Array.isArray(candidate.applications)
    ? candidate.applications
    : (candidate as any)?.applications?.data || [];

  const activeApp = applicationsList[0] || null;
  const rawMeta: any = candidate.metadata || {};

  const atsScore =
    activeApp?.atsScore ??
    (typeof rawMeta.atsScore === 'number' ? rawMeta.atsScore : null) ??
    rawMeta.atsScoreBreakdown?.score ??
    null;

  const candidateName = formatCandidateName(candidate.firstName, candidate.lastName);
  const initials = getInitials(candidateName);
  const resolvedResumeUrl = getResumeUri(candidate.resumeUrl || activeApp?.resumeUrl || rawMeta.resumeUrl);

  const handleCall = () => {
    if (candidate.phone) Linking.openURL(`tel:${candidate.phone}`);
  };

  const handleWhatsApp = () => {
    if (candidate.phone) {
      const cleanPhone = candidate.phone.replace(/[^\d+]/g, '');
      Linking.openURL(`https://wa.me/${cleanPhone}`);
    }
  };

  const handleEmail = () => {
    if (candidate.email) Linking.openURL(`mailto:${candidate.email}`);
  };

  const handleOpenResume = () => {
    if (resolvedResumeUrl) {
      Linking.openURL(resolvedResumeUrl);
    } else {
      setActiveTab('RESUME');
    }
  };

  const handleOpenLink = (url?: string) => {
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(fullUrl);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={[styles.topBar, { paddingTop: topPadding }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {candidateName}
        </Text>
        {activeApp?.currentStage?.name ? (
          <View style={styles.topStagePill}>
            <Text style={styles.topStageText}>{activeApp.currentStage.name}</Text>
          </View>
        ) : <View style={{ width: 32 }} />}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Unified Premium Candidate Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            {/* Gradient Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            {/* Profile Info */}
            <View style={styles.heroInfo}>
              <Text style={styles.name} numberOfLines={1}>
                {candidateName}
              </Text>

              {/* Status / Score Badges */}
              <View style={styles.badgesRow}>
                {activeApp?.currentStage?.name ? (
                  <StageBadge stageName={activeApp.currentStage.name} />
                ) : (
                  <View style={styles.poolBadge}>
                    <Text style={styles.poolBadgeText}>Talent Pool</Text>
                  </View>
                )}
                {atsScore !== null && (
                  <ScorePill score={atsScore} size="small" />
                )}
              </View>

              {/* Role & Company */}
              <View style={styles.metaRow}>
                <Ionicons name="briefcase-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.roleText} numberOfLines={1}>
                  {candidate.currentTitle || 'Candidate'}{' '}
                  {candidate.currentCompany ? `@ ${candidate.currentCompany}` : ''}
                </Text>
              </View>

              {/* Location */}
              {candidate.location ? (
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {candidate.location}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Sourcing & Application Meta */}
          <View style={styles.sourceMetaRow}>
            <View style={styles.sourceTag}>
              <Text style={styles.sourceTagText}>
                Source: {activeApp?.source || candidate.source || 'Career Portal'}
              </Text>
            </View>
            {activeApp?.appliedAt && (
              <Text style={styles.appliedDateText}>
                Applied {new Date(activeApp.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            )}
          </View>

          {/* 4-Column Executive Action Grid */}
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionTile, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
              onPress={handleWhatsApp}
              activeOpacity={0.7}
              disabled={!candidate.phone}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#10B981' }]}>
                <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionLabel, { color: '#047857' }]}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionTile, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}
              onPress={handleCall}
              activeOpacity={0.7}
              disabled={!candidate.phone}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#0284C7' }]}>
                <Ionicons name="call" size={15} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionLabel, { color: '#0369A1' }]}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionTile, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}
              onPress={handleEmail}
              activeOpacity={0.7}
              disabled={!candidate.email}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#475569' }]}>
                <Ionicons name="mail" size={15} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionLabel, { color: '#334155' }]}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionTile, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}
              onPress={handleOpenResume}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#4F46E5' }]}>
                <Ionicons name="document-text" size={15} color="#FFFFFF" />
              </View>
              <Text style={[styles.actionLabel, { color: '#3730A3' }]}>Resume</Text>
            </TouchableOpacity>
          </View>

          {/* Social Links Row (LinkedIn, GitHub, Portfolio) */}
          {(candidate.linkedinUrl || candidate.githubUrl || candidate.portfolioUrl) ? (
            <View style={styles.socialRow}>
              {candidate.linkedinUrl ? (
                <TouchableOpacity
                  style={styles.socialPill}
                  onPress={() => handleOpenLink(candidate.linkedinUrl)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-linkedin" size={13} color="#0A66C2" />
                  <Text style={styles.socialPillText}>LinkedIn</Text>
                </TouchableOpacity>
              ) : null}

              {candidate.githubUrl ? (
                <TouchableOpacity
                  style={styles.socialPill}
                  onPress={() => handleOpenLink(candidate.githubUrl)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-github" size={13} color="#1E293B" />
                  <Text style={styles.socialPillText}>GitHub</Text>
                </TouchableOpacity>
              ) : null}

              {candidate.portfolioUrl ? (
                <TouchableOpacity
                  style={styles.socialPill}
                  onPress={() => handleOpenLink(candidate.portfolioUrl)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="globe-outline" size={13} color="#2563EB" />
                  <Text style={styles.socialPillText}>Portfolio</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Segmented Control Tabs (Matching Web Mobile View) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'OVERVIEW' && styles.tabButtonActive]}
            onPress={() => setActiveTab('OVERVIEW')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'OVERVIEW' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'RESUME' && styles.tabButtonActive]}
            onPress={() => setActiveTab('RESUME')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'RESUME' && styles.tabTextActive]}>
              Resume
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'APPLICATIONS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('APPLICATIONS')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'APPLICATIONS' && styles.tabTextActive]}>
              Applications ({applicationsList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <View style={styles.tabContent}>
            {/* AI ATS Match Breakdown Card */}
            {atsScore !== null && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>AI Match Assessment</Text>
                  </View>
                  <ScorePill score={atsScore} size="medium" />
                </View>

                {rawMeta.summary ? (
                  <Text style={styles.aiSummaryText}>{rawMeta.summary}</Text>
                ) : (
                  <Text style={styles.aiSummaryText}>
                    Candidate credentials and experience have been parsed with an ATS alignment score of {Math.round(atsScore)}%.
                  </Text>
                )}

                {/* Match highlights if present */}
                {rawMeta.atsScoreBreakdown?.strengths && rawMeta.atsScoreBreakdown.strengths.length > 0 && (
                  <View style={styles.highlightList}>
                    {rawMeta.atsScoreBreakdown.strengths.map((item: string, idx: number) => (
                      <View key={idx} style={styles.highlightItem}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.highlightText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Key Skills Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="code-slash-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Key Skills ({candidate.skills?.length || 0})</Text>
              </View>

              {candidate.skills && candidate.skills.length > 0 ? (
                <View style={styles.skillsCloud}>
                  {candidate.skills.map((sk, idx) => (
                    <View key={idx} style={styles.skillBadge}>
                      <Text style={styles.skillBadgeText}>{sk}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No skills extracted yet.</Text>
              )}
            </View>

            {/* Current Application Requisition Card */}
            {activeApp && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="layers-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Current Position</Text>
                </View>

                <View style={styles.positionDetailCard}>
                  <Text style={styles.positionTitle}>{activeApp.job?.title || 'Open Requisition'}</Text>
                  <Text style={styles.positionDept}>{activeApp.job?.department || 'General'}</Text>
                  <View style={styles.positionMetaRow}>
                    <StageBadge stageName={activeApp.currentStage?.name || 'Applied'} />
                    <Text style={styles.positionStatus}>Status: {activeApp.status || 'Active'}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tab 2: RESUME */}
        {activeTab === 'RESUME' && (
          <View style={styles.tabContent}>
            {/* PDF View / Download Bar */}
            {resolvedResumeUrl ? (
              <View style={styles.resumeActionCard}>
                <View style={styles.resumeFileMeta}>
                  <View style={styles.pdfIconBox}>
                    <Ionicons name="document-text" size={24} color="#EF4444" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resumeFileName} numberOfLines={1}>
                      {candidateName} Resume.pdf
                    </Text>
                    <Text style={styles.resumeFileSub}>PDF Document • Verified Attachment</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.openPdfBtn}
                  onPress={() => Linking.openURL(resolvedResumeUrl)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="open-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.openPdfBtnText}>Open / Download PDF</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Extracted Resume Content Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="reader-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Parsed Resume Content</Text>
              </View>

              {rawMeta.parsedContent || rawMeta.text || rawMeta.summary ? (
                <Text style={styles.parsedResumeText}>
                  {rawMeta.parsedContent || rawMeta.text || rawMeta.summary}
                </Text>
              ) : (
                <View style={styles.noResumeBox}>
                  <Ionicons name="document-outline" size={32} color={COLORS.textLight} />
                  <Text style={styles.emptyText}>
                    {resolvedResumeUrl
                      ? 'Resume is available to view via the button above.'
                      : 'No resume document has been uploaded for this candidate yet.'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Tab 3: APPLICATIONS */}
        {activeTab === 'APPLICATIONS' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="briefcase-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Application History ({applicationsList.length})</Text>
              </View>

              {applicationsList.length > 0 ? (
                applicationsList.map((app, idx) => (
                  <View key={app.id || idx} style={styles.appHistoryCard}>
                    <View style={styles.appCardTop}>
                      <Text style={styles.appJobTitle}>{app.job?.title || 'Requisition'}</Text>
                      {app.atsScore !== undefined && <ScorePill score={app.atsScore} />}
                    </View>
                    <Text style={styles.appDeptText}>{app.job?.department || 'Department'}</Text>
                    <View style={styles.appCardBottom}>
                      <StageBadge stageName={app.currentStage?.name || 'Applied'} />
                      <Text style={styles.appDateText}>
                        {new Date(app.appliedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No applications found for this candidate.</Text>
              )}
            </View>
          </View>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  backButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  topBarTitle: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  topStagePill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  topStageText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  avatarText: {
    fontFamily: FONTS.family,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: FONTS.family,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 2,
  },
  poolBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  poolBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  roleText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  locationText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    flex: 1,
  },
  sourceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 12,
  },
  sourceTag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  sourceTagText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  appliedDateText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textLight,
  },
  actionGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionIconBg: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    fontFamily: FONTS.family,
    fontSize: 10,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
  },
  socialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  socialPillText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  tabText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  tabContent: {
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  aiSummaryText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  highlightList: {
    marginTop: 10,
    gap: 6,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  highlightText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  skillsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  skillBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  skillBadgeText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  positionDetailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  positionTitle: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  positionDept: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  positionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  positionStatus: {
    fontFamily: FONTS.family,
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  resumeActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
    gap: 12,
  },
  resumeFileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pdfIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeFileName: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  resumeFileSub: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  openPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 12,
  },
  openPdfBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  parsedResumeText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    lineHeight: 19,
    color: '#334155',
  },
  noResumeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  appHistoryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  appCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  appJobTitle: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  appDeptText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  appCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  appDateText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: '#94A3B8',
  },
  emptyText: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});
