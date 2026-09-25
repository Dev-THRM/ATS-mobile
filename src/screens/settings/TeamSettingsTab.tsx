import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { OrganizationMember, OrganizationRole } from '../../types/auth.types';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../../theme/theme';

export const TeamSettingsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isSuperAdminOrAdmin =
    user?.role?.type === 'SUPER_ADMIN' || user?.role?.type === 'ADMIN';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);

  // Edit Colleague State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Invite Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Fetch Members
  const {
    data: members = [],
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
    isRefetching: isRefetchingMembers,
  } = useQuery({
    queryKey: ['organization-members'],
    queryFn: authApi.getOrganizationMembers,
  });

  // 2. Fetch Roles
  const { data: roles = [] } = useQuery({
    queryKey: ['organization-roles'],
    queryFn: authApi.getOrganizationRoles,
  });

  // 3. Fetch Organization Data (for maxUsers)
  const { data: orgData } = useQuery({
    queryKey: ['organization-settings'],
    queryFn: authApi.getOrganization,
  });

  const maxUsers = orgData?.subscription?.maxUsers || 25;
  const usedSeats = members.length;
  const seatPercentage = Math.min(100, Math.round((usedSeats / maxUsers) * 100));

  // Add Member Mutation
  const addMemberMutation = useMutation({
    mutationFn: authApi.addOrganizationMember,
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      setIsInviteModalVisible(false);
      resetInviteForm();
      Alert.alert(
        'Colleague Added',
        `${newMember.firstName} ${newMember.lastName} has been added to ${user?.organization?.name || 'the workspace'}.`,
      );
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || 'Failed to add team member.';
      setFormError(Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  // Update Member Mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      authApi.updateOrganizationMember(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      setIsEditModalVisible(false);
      setEditingMember(null);
      Alert.alert('Success', 'Team member updated successfully.');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || 'Failed to update member.';
      const formatted = Array.isArray(msg) ? msg.join('\n') : msg;
      setEditFormError(formatted);
      Alert.alert('Error', formatted);
    },
  });

  // Remove Member Mutation
  const removeMemberMutation = useMutation({
    mutationFn: authApi.removeOrganizationMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-members'] });
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
      Alert.alert('Member Removed', 'Colleague has been removed from workspace.');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || 'Failed to remove member.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    },
  });

  const resetInviteForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    const defaultRole = roles.find((r) => r.type === 'RECRUITER') || roles[0];
    setRoleId(defaultRole?.id || '');
    setPassword('');
    setPhone('');
    setFormError(null);
  };

  const handleOpenInvite = () => {
    resetInviteForm();
    setIsInviteModalVisible(true);
  };

  const handleSendInvite = () => {
    setFormError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('First and last name are required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid company email address.');
      return;
    }
    if (!roleId) {
      setFormError('Please select a system role for this member.');
      return;
    }

    addMemberMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      roleId,
      password: password.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  const handleOpenEdit = (member: OrganizationMember) => {
    setEditingMember(member);
    setEditFirstName(member.firstName || '');
    setEditLastName(member.lastName || '');
    setEditPhone(member.phone || '');
    setEditRoleId(member.role?.id || '');
    setEditIsActive(member.isActive ?? true);
    setEditFormError(null);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingMember) return;
    setEditFormError(null);

    const isSelfEdit = editingMember.id === user?.id;

    if (!editFirstName.trim() || !editLastName.trim()) {
      setEditFormError('First and last name are required.');
      return;
    }
    if (!isSelfEdit && !editRoleId) {
      setEditFormError('Please select a system role for this colleague.');
      return;
    }

    const payload: Record<string, unknown> = {
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      phone: editPhone.trim() || null,
    };

    if (!isSelfEdit) {
      payload.roleId = editRoleId;
      payload.isActive = editIsActive;
    }

    updateMemberMutation.mutate({
      id: editingMember.id,
      payload,
    });
  };

  const handleToggleActive = (member: OrganizationMember) => {
    const action = member.isActive ? 'Deactivate' : 'Reactivate';
    Alert.alert(
      `${action} Colleague`,
      `Are you sure you want to ${action.toLowerCase()} ${member.firstName} ${member.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: member.isActive ? 'destructive' : 'default',
          onPress: () =>
            updateMemberMutation.mutate({
              id: member.id,
              payload: { isActive: !member.isActive },
            }),
        },
      ],
    );
  };

  const handleConfirmRemove = (member: OrganizationMember) => {
    Alert.alert(
      'Remove Colleague',
      `Revoke ${member.firstName} ${member.lastName}'s access to ${user?.organization?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMemberMutation.mutate(member.id),
        },
      ],
    );
  };

  const getRoleColors = (type?: string) => {
    switch (type) {
      case 'SUPER_ADMIN':
        return { bg: '#FAF5FF', text: '#6B21A8', border: '#E9D5FF' };
      case 'ADMIN':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'RECRUITER':
        return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
      case 'MANAGER':
        return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' };
      default:
        return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0' };
    }
  };

  const filteredMembers = members.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(query) ||
      m.lastName.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      (m.phone && m.phone.toLowerCase().includes(query))
    );
  });

  return (
    <View style={styles.container}>
      {/* 1. Seat Capacity & Invite Banner */}
      <View style={styles.seatsCard}>
        <View style={styles.seatsHeaderRow}>
          <View style={styles.seatsIconBadge}>
            <Ionicons name="people" size={18} color="#2563EB" />
          </View>
          <View style={styles.seatsTextCol}>
            <Text style={styles.seatsTitle}>Seats &amp; Access Control</Text>
            <Text style={styles.seatsSubtitle}>
              Scoped strictly to {user?.organization?.name}
            </Text>
          </View>
        </View>

        {/* Usage Metric Bar */}
        <View style={styles.usageMetricContainer}>
          <View style={styles.usageMetricLabels}>
            <Text style={styles.usageLabel}>Seats Occupied</Text>
            <Text style={styles.usageCount}>
              {usedSeats} / {maxUsers}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${seatPercentage}%`,
                  backgroundColor:
                    seatPercentage >= 90
                      ? '#EF4444'
                      : seatPercentage >= 75
                      ? '#F59E0B'
                      : '#2563EB',
                },
              ]}
            />
          </View>
          <Text style={styles.usageHint}>
            {maxUsers - usedSeats > 0
              ? `${maxUsers - usedSeats} seats available on company plan`
              : 'Seat limit reached for this workspace'}
          </Text>
        </View>

        {isSuperAdminOrAdmin && (
          <TouchableOpacity
            style={[
              styles.addMemberBtn,
              usedSeats >= maxUsers && styles.addMemberBtnDisabled,
            ]}
            onPress={handleOpenInvite}
            disabled={usedSeats >= maxUsers}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addMemberBtnText}>+ Invite Colleague</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Search & Filter Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search colleagues..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => refetchMembers()}
          disabled={isRefetchingMembers}
          activeOpacity={0.7}
        >
          {isRefetchingMembers ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <Ionicons name="refresh-outline" size={17} color="#475569" />
          )}
        </TouchableOpacity>
      </View>

      {/* 3. Team Member Cards List */}
      {isLoadingMembers ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading colleagues...</Text>
        </View>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          iconName="people-outline"
          title={searchQuery ? 'No Colleague Found' : 'No Team Members Yet'}
          description={
            searchQuery
              ? 'Try searching with a different name or email.'
              : 'Invite colleagues to your workspace to collaborate on candidate hiring.'
          }
        />
      ) : (
        <View style={styles.membersList}>
          {filteredMembers.map((member) => {
            const isSelf = member.id === user?.id;
            const isSuperAdmin = member.role?.type === 'SUPER_ADMIN';
            const roleStyle = getRoleColors(member.role?.type);

            return (
              <View key={member.id} style={styles.memberCard}>
                {/* Top: Avatar, Name, Role */}
                <View style={styles.memberTopRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {member.firstName?.[0] || 'U'}
                      {member.lastName?.[0] || ''}
                    </Text>
                  </View>

                  <View style={styles.memberInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {member.firstName} {member.lastName}
                      </Text>
                      {isSelf && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>You</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberEmail} numberOfLines={1}>
                      {member.email}
                    </Text>
                    {member.phone ? (
                      <Text style={styles.memberPhone}>{member.phone}</Text>
                    ) : null}
                  </View>

                  {/* Role Pill */}
                  <View
                    style={[
                      styles.rolePill,
                      { backgroundColor: roleStyle.bg, borderColor: roleStyle.border },
                    ]}
                  >
                    <Text style={[styles.rolePillText, { color: roleStyle.text }]}>
                      {member.role?.name || member.role?.type}
                    </Text>
                  </View>
                </View>

                {/* Bottom Row: Status & Actions */}
                <View style={styles.memberBottomRow}>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: member.isActive ? '#10B981' : '#EF4444' },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {member.isActive ? 'Active Access' : 'Deactivated'}
                    </Text>
                  </View>

                  {isSuperAdminOrAdmin && (
                    <View style={styles.memberActionsRow}>
                      {/* Edit Button — always shown for self or manageable members */}
                      {(isSelf || !isSuperAdmin) && (
                        <TouchableOpacity
                          style={isSelf ? styles.editBtnSelf : styles.editBtn}
                          onPress={() => handleOpenEdit(member)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="pencil" size={13} color="#2563EB" />
                          <Text style={styles.editBtnText}>{isSelf ? 'Edit Profile' : 'Edit'}</Text>
                        </TouchableOpacity>
                      )}

                      {/* Delete Button — only for non-self, non-super-admin */}
                      {!isSelf && !isSuperAdmin && (
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleConfirmRemove(member)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={13} color="#DC2626" />
                          <Text style={styles.deleteBtnText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* =====================================================================
       * INVITE COLLEAGUE MODAL
       * ===================================================================== */}
      {/* =====================================================================
       * INVITE COLLEAGUE MODAL
       * ===================================================================== */}
      <Modal
        visible={isInviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInviteModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setIsInviteModalVisible(false)}
            />
            <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderIconBadge}>
                  <Ionicons name="person-add" size={20} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.modalTitleRow}>
                    <Text style={styles.modalTitle}>Invite Team Member</Text>
                  </View>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    Workspace: {user?.organization?.name || 'Your Company'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsInviteModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Form Error */}
              {formError && (
                <View style={styles.errorAlert}>
                  <Ionicons name="alert-circle" size={17} color="#DC2626" />
                  <Text style={styles.errorAlertText}>{formError}</Text>
                </View>
              )}

              {/* Section 1: Colleague Profile & Contact */}
              <View style={styles.formSectionCard}>
                <View style={styles.formSectionHeader}>
                  <Ionicons name="person-outline" size={15} color="#2563EB" />
                  <Text style={styles.formSectionTitle}>1. Colleague Profile &amp; Contact</Text>
                </View>

                {/* First Name & Last Name */}
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>First Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Rahul"
                      placeholderTextColor="#94A3B8"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Last Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Sharma"
                      placeholderTextColor="#94A3B8"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>
                </View>

                {/* Company Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company Email *</Text>
                  <View style={styles.inputBoxWithIcon}>
                    <Ionicons name="mail-outline" size={17} color="#94A3B8" style={styles.inputIconLeft} />
                    <TextInput
                      style={styles.textInputWithIcon}
                      placeholder="colleague@yourcompany.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                  <Text style={styles.inputSubHint}>
                    Login credentials will be restricted exclusively to this organization.
                  </Text>
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number (Optional)</Text>
                  <View style={styles.inputBoxWithIcon}>
                    <Ionicons name="call-outline" size={17} color="#94A3B8" style={styles.inputIconLeft} />
                    <TextInput
                      style={styles.textInputWithIcon}
                      placeholder="+91 98765 43210"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                </View>
              </View>

              {/* Section 2: Role & System Permissions */}
              <View style={styles.formSectionCard}>
                <View style={styles.formSectionHeader}>
                  <Ionicons name="shield-checkmark-outline" size={15} color="#2563EB" />
                  <Text style={styles.formSectionTitle}>2. System Role &amp; Permissions *</Text>
                </View>

                <View style={styles.rolePickerList}>
                  {roles
                    .filter((r) => r.type !== 'SUPER_ADMIN')
                    .map((r) => {
                      const isSelected = roleId === r.id;
                      const roleColors = getRoleColors(r.type);
                      return (
                        <TouchableOpacity
                          key={r.id}
                          style={[
                            styles.roleChip,
                            isSelected && styles.roleChipSelected,
                          ]}
                          onPress={() => setRoleId(r.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.roleChipHeader}>
                            <View style={[styles.roleMiniBadge, { backgroundColor: roleColors.bg, borderColor: roleColors.border }]}>
                              <Text style={[styles.roleMiniBadgeText, { color: roleColors.text }]}>
                                {r.name}
                              </Text>
                            </View>
                            <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                              {isSelected && (
                                <Ionicons
                                  name="checkmark"
                                  size={13}
                                  color="#FFFFFF"
                                />
                              )}
                            </View>
                          </View>
                          <Text style={styles.roleChipDesc}>
                            {r.description || 'Standard workspace member permissions'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              </View>

              {/* Section 3: Credentials */}
              <View style={styles.formSectionCard}>
                <View style={styles.formSectionHeader}>
                  <Ionicons name="lock-closed-outline" size={15} color="#2563EB" />
                  <Text style={styles.formSectionTitle}>3. Security &amp; Credentials</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Temporary Password (Optional)</Text>
                  <View style={styles.inputBoxWithIcon}>
                    <Ionicons name="lock-closed-outline" size={17} color="#94A3B8" style={styles.inputIconLeft} />
                    <TextInput
                      style={styles.textInputWithIcon}
                      placeholder="Leave blank to auto-generate password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                  <Text style={styles.inputSubHint}>
                    Colleague can also use "Forgot Password" anytime with their company email.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsInviteModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSendInvite}
                disabled={addMemberMutation.isPending}
                activeOpacity={0.8}
              >
                {addMemberMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Grant ATS Access</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>


      {/* =====================================================================
       * EDIT COLLEAGUE MODAL
       * ===================================================================== */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setIsEditModalVisible(false)}
            />
            <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderIconBadge}>
                  <Ionicons name="pencil" size={20} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Edit Team Member</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {editingMember?.email} • {user?.organization?.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Error Alert */}
              {editFormError && (
                <View style={styles.errorAlert}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorAlertText}>{editFormError}</Text>
                </View>
              )}

              {/* Section 1: Member Profile & Contact */}
              <View style={styles.formSectionCard}>
                <View style={styles.formSectionHeader}>
                  <Ionicons name="person-outline" size={15} color="#2563EB" />
                  <Text style={styles.formSectionTitle}>1. Colleague Profile &amp; Contact</Text>
                </View>

                {/* First & Last Name Row */}
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>First Name *</Text>
                    <View style={styles.inputBoxWithIcon}>
                      <Ionicons name="person-outline" size={17} color="#94A3B8" style={styles.inputIconLeft} />
                      <TextInput
                        style={styles.textInputWithIcon}
                        placeholder="First name"
                        placeholderTextColor="#94A3B8"
                        value={editFirstName}
                        onChangeText={setEditFirstName}
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Last Name *</Text>
                    <View style={styles.inputBoxWithIcon}>
                      <Ionicons name="person-outline" size={17} color="#94A3B8" style={styles.inputIconLeft} />
                      <TextInput
                        style={styles.textInputWithIcon}
                        placeholder="Last name"
                        placeholderTextColor="#94A3B8"
                        value={editLastName}
                        onChangeText={setEditLastName}
                      />
                    </View>
                  </View>
                </View>

                {/* Company Email (Locked) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company Email (Locked)</Text>
                  <View style={[styles.inputBoxWithIcon, styles.inputBoxLocked]}>
                    <Ionicons name="lock-closed-outline" size={17} color="#94A3B8" style={styles.inputIconLeft} />
                    <TextInput
                      style={[styles.textInputWithIcon, styles.textInputLocked]}
                      value={editingMember?.email || ''}
                      editable={false}
                    />
                  </View>
                  <Text style={styles.inputSubHint}>
                    Workspace identity is permanently associated with this corporate address.
                  </Text>
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number (Optional)</Text>
                  <View style={styles.inputBoxWithIcon}>
                    <Ionicons name="call-outline" size={17} color="#94A3B8" style={styles.inputIconLeft} />
                    <TextInput
                      style={styles.textInputWithIcon}
                      placeholder="+91 98765 43210"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={editPhone}
                      onChangeText={setEditPhone}
                    />
                  </View>
                </View>
              </View>

              {/* Section 2: Role & System Permissions — hidden when editing self */}
              {editingMember?.id !== user?.id && (
                <View style={styles.formSectionCard}>
                  <View style={styles.formSectionHeader}>
                    <Ionicons name="shield-checkmark-outline" size={15} color="#2563EB" />
                    <Text style={styles.formSectionTitle}>2. Role &amp; System Permissions</Text>
                  </View>

                  <View style={styles.rolePickerList}>
                    {roles
                      .filter((r) => r.type !== 'SUPER_ADMIN')
                      .map((r) => {
                        const isSelected = editRoleId === r.id;
                        const roleColors = getRoleColors(r.type);
                        return (
                          <TouchableOpacity
                            key={r.id}
                            style={[
                              styles.roleChip,
                              isSelected && styles.roleChipSelected,
                            ]}
                            onPress={() => setEditRoleId(r.id)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.roleChipHeader}>
                              <View
                                style={[
                                  styles.roleMiniBadge,
                                  {
                                    backgroundColor: roleColors.bg,
                                    borderColor: roleColors.border,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.roleMiniBadgeText,
                                    { color: roleColors.text },
                                  ]}
                                >
                                  {r.name}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.checkCircle,
                                  isSelected && styles.checkCircleSelected,
                                ]}
                              >
                                {isSelected && (
                                  <Ionicons
                                    name="checkmark"
                                    size={13}
                                    color="#FFFFFF"
                                  />
                                )}
                              </View>
                            </View>
                            <Text style={styles.roleChipDesc}>
                              {r.description || 'Standard workspace permissions'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </View>
              )}

              {/* Section 3: Account Status & Access State — hidden when editing self */}
              {editingMember?.id !== user?.id && (
                <View style={styles.formSectionCard}>
                  <View style={styles.formSectionHeader}>
                    <Ionicons name="pulse-outline" size={15} color="#2563EB" />
                    <Text style={styles.formSectionTitle}>3. Account Status &amp; Access</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.statusToggleCard,
                      editIsActive ? styles.statusToggleCardActive : styles.statusToggleCardInactive,
                    ]}
                    onPress={() => setEditIsActive(!editIsActive)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: editIsActive ? '#10B981' : '#EF4444' },
                          ]}
                        />
                        <Text style={styles.statusToggleTitle}>
                          {editIsActive ? 'Active Access' : 'Suspended Access'}
                        </Text>
                      </View>
                      <Text style={styles.statusToggleSubtitle}>
                        {editIsActive
                          ? 'Member can log in and manage candidates.'
                          : 'Access is suspended. Login sessions are blocked.'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.togglePill,
                        editIsActive ? styles.togglePillActive : styles.togglePillInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.togglePillText,
                          editIsActive ? styles.togglePillTextActive : styles.togglePillTextInactive,
                        ]}
                      >
                        {editIsActive ? 'Active' : 'Suspended'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSaveEdit}
                disabled={updateMemberMutation.isPending}
                activeOpacity={0.8}
              >
                {updateMemberMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  seatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  seatsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  seatsIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatsTextCol: {
    flex: 1,
  },
  seatsTitle: {
    fontFamily: FONTS.family,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  seatsSubtitle: {
    fontFamily: FONTS.family,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  usageMetricContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  usageMetricLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  usageCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  usageHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    height: 44,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  addMemberBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  addMemberBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  refreshBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  memberTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  youBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  memberEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  memberPhone: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  memberBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  memberActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  editBtnSelf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  inputBoxLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  textInputLocked: {
    color: '#64748B',
  },
  statusToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  statusToggleCardActive: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  statusToggleCardInactive: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  statusToggleTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusToggleSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  togglePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  togglePillActive: {
    backgroundColor: '#10B981',
  },
  togglePillInactive: {
    backgroundColor: '#EF4444',
  },
  togglePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  togglePillTextActive: {
    color: '#FFFFFF',
  },
  togglePillTextInactive: {
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 620,
    maxHeight: '86%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalHeaderIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    marginBottom: 14,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorAlertText: {
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
    fontWeight: '600',
  },
  formSectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  formSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 46,
    fontSize: 13,
    color: '#0F172A',
  },
  inputBoxWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 46,
  },
  inputIconLeft: {
    marginRight: 8,
  },
  textInputWithIcon: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#0F172A',
  },
  inputSubHint: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 4,
  },
  rolePickerList: {
    gap: 8,
  },
  roleChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  roleChipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleMiniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleMiniBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkCircleSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  roleChipDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOWS.sm,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

