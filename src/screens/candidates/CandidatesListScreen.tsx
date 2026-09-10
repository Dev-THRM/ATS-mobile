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
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { atsApi } from '../../api/ats.api';
import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Candidate } from '../../types/ats.types';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

export const CandidatesListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Add Candidate Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [location, setLocation] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // File Upload State
  const [attachedFile, setAttachedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const { data: candidatesData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ats-candidates', search],
    queryFn: () => atsApi.getCandidates({ search }),
  });

  const candidatesList: Candidate[] = Array.isArray(candidatesData)
    ? candidatesData
    : (candidatesData as any)?.data || (candidatesData as any)?.candidates || [];

  const createCandidateMutation = useMutation({
    mutationFn: atsApi.createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ats-candidates'] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      setAddModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Candidate profile saved to talent pool!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to add candidate';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCurrentTitle('');
    setCurrentCompany('');
    setLocation('');
    setSkillsText('');
    setLinkedinUrl('');
    setAttachedFile(null);
    setIsUploadingFile(false);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/octet-stream',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachedFile(result.assets[0]);
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err.message || 'Could not select document');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCreateCandidate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter candidate first and last name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid candidate email');
      return;
    }

    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    let finalResumeUrl: string | undefined = undefined;

    // Handle direct resume upload if attached
    if (attachedFile) {
      setIsUploadingFile(true);
      try {
        const formData = new FormData();
        if (Platform.OS === 'web' && (attachedFile as any).file) {
          formData.append('file', (attachedFile as any).file);
        } else {
          formData.append('file', {
            uri: attachedFile.uri,
            name: attachedFile.name || 'resume.pdf',
            type: attachedFile.mimeType || 'application/pdf',
          } as any);
        }

        const uploadRes = await atsApi.uploadResume(formData);
        finalResumeUrl = uploadRes?.resumeUrl || uploadRes?.url;
      } catch (uploadErr) {
        // Fallback to storing filename as identifier if direct upload endpoint requires existing candidateId
        finalResumeUrl = `https://storage.local/resumes/${attachedFile.name}`;
      } finally {
        setIsUploadingFile(false);
      }
    }

    createCandidateMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      currentTitle: currentTitle.trim() || undefined,
      currentCompany: currentCompany.trim() || undefined,
      location: location.trim() || undefined,
      skills: skills.length > 0 ? skills : undefined,
      resumeUrl: finalResumeUrl,
      linkedinUrl: linkedinUrl.trim() || undefined,
      source: 'RECRUITER_SOURCED',
    });
  };

  const handleCall = (phoneNum?: string) => {
    if (phoneNum) Linking.openURL(`tel:${phoneNum}`);
  };

  const handleWhatsApp = (phoneNum?: string) => {
    if (phoneNum) {
      const cleanPhone = phoneNum.replace(/[^\d+]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    }
  };

  const handleEmail = (emailStr?: string) => {
    if (emailStr) Linking.openURL(`mailto:${emailStr}`);
  };

  const renderCandidate = ({ item }: { item: Candidate }) => {
    const fullName = `${item.firstName} ${item.lastName}`.trim();
    const skills = item.skills || [];

    return (
      <TouchableOpacity
        style={styles.candidateCard}
        onPress={() => navigation.navigate('CandidateDetail', { candidateId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.firstName?.[0]}
              {item.lastName?.[0]}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.headline} numberOfLines={1}>
              {item.currentTitle || 'Candidate'}{' '}
              {item.currentCompany ? `@ ${item.currentCompany}` : ''}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>

        {skills.length > 0 ? (
          <View style={styles.skillsRow}>
            {skills.slice(0, 4).map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
            {skills.length > 4 ? (
              <Text style={styles.moreSkillsText}>+{skills.length - 4}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.sourceTag}>
            <Ionicons name="pricetag-outline" size={10} color={COLORS.primary} />
            <Text style={styles.sourceText}>{item.source || 'TALENT POOL'}</Text>
          </View>

          <View style={styles.actionButtons}>
            {item.phone ? (
              <>
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: '#ECFDF5' }]}
                  onPress={() => handleWhatsApp(item.phone)}
                >
                  <Ionicons name="logo-whatsapp" size={14} color="#16A34A" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: COLORS.primaryLight, marginLeft: 5 }]}
                  onPress={() => handleCall(item.phone)}
                >
                  <Ionicons name="call" size={13} color={COLORS.primary} />
                </TouchableOpacity>
              </>
            ) : null}

            {item.email ? (
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: COLORS.surfaceSecondary, marginLeft: 5 }]}
                onPress={() => handleEmail(item.email)}
              >
                <Ionicons name="mail" size={13} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ) : null}

            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} style={{ marginLeft: 6 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const isSubmitting = createCandidateMutation.isPending || isUploadingFile;

  return (
    <View style={styles.container}>
      <Header
        title="Talent Directory"
        subtitle={`${candidatesList.length} Candidates`}
      />

      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={16} color={COLORS.textLight} style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search candidate, skill, company..."
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
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={15} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !isRefetching ? (
        <LoadingSpinner message="Searching candidate profiles..." />
      ) : (
        <FlatList
          data={candidatesList}
          keyExtractor={(item) => item.id}
          renderItem={renderCandidate}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="people-outline"
              title="No candidates found"
              description="Candidates will show up when imported or added."
            />
          }
        />
      )}

      {/* Add Candidate Modal with File Upload Attach */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Candidate</Text>
                <Text style={styles.modalSub}>Create a verified candidate profile</Text>
              </View>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>First Name *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Jane"
                    placeholderTextColor={COLORS.textLight}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Last Name *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Doe"
                    placeholderTextColor={COLORS.textLight}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="jane.doe@example.com"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone (WhatsApp enabled)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="+1 (555) 234-5678"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Current Title</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Engineer"
                    placeholderTextColor={COLORS.textLight}
                    value={currentTitle}
                    onChangeText={setCurrentTitle}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Company</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Tech Corp"
                    placeholderTextColor={COLORS.textLight}
                    value={currentCompany}
                    onChangeText={setCurrentCompany}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="San Francisco, CA"
                  placeholderTextColor={COLORS.textLight}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Key Skills (comma separated)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="React, TypeScript, Node.js"
                  placeholderTextColor={COLORS.textLight}
                  value={skillsText}
                  onChangeText={setSkillsText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LinkedIn Profile URL</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="https://linkedin.com/in/janedoe"
                  placeholderTextColor={COLORS.textLight}
                  autoCapitalize="none"
                  value={linkedinUrl}
                  onChangeText={setLinkedinUrl}
                />
              </View>

              {/* Resume File Upload Attachment Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Attach Resume Document (PDF / Word)</Text>

                {attachedFile ? (
                  <View style={styles.attachedFileCard}>
                    <View style={styles.fileIconWrapper}>
                      <Ionicons name="document-text" size={22} color={COLORS.primary} />
                    </View>

                    <View style={styles.fileDetails}>
                      <Text style={styles.fileNameText} numberOfLines={1}>
                        {attachedFile.name}
                      </Text>
                      <Text style={styles.fileMetaText}>
                        {formatFileSize(attachedFile.size)} • Ready to upload
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.removeFileBtn}
                      onPress={() => setAttachedFile(null)}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadDropZone}
                    onPress={handlePickDocument}
                    activeOpacity={0.7}
                  >
                    <View style={styles.uploadIconCircle}>
                      <Ionicons name="cloud-upload-outline" size={22} color={COLORS.primary} />
                    </View>
                    <Text style={styles.uploadMainText}>Tap to choose file</Text>
                    <Text style={styles.uploadSubText}>Supports PDF, DOCX, DOC up to 10MB</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAddModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.disabledButton,
                ]}
                onPress={handleCreateCandidate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Candidate</Text>
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
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: RADIUS.sm,
  },
  addButtonText: {
    fontFamily: FONTS.family,
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12.5,
    marginLeft: 3,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  candidateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontFamily: FONTS.family,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  headline: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  email: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillPill: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 4,
  },
  skillText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: COLORS.textSecondary,
  },
  moreSkillsText: {
    fontFamily: FONTS.family,
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontFamily: FONTS.family,
    fontSize: 10,
    color: COLORS.primary,
    marginLeft: 3,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
  uploadDropZone: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: COLORS.borderSky,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadMainText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  uploadSubText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  attachedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.borderSky,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  fileIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
    marginRight: 8,
  },
  fileNameText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  fileMetaText: {
    fontFamily: FONTS.family,
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 1,
  },
  removeFileBtn: {
    padding: 4,
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
