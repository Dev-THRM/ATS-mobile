import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { Interview } from '../../types/ats.types';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';

interface SubmitFeedbackModalProps {
  visible: boolean;
  interview: Interview;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({
  visible,
  interview,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(interview.feedbackRating || 5);
  const [notes, setNotes] = useState<string>(interview.feedbackNotes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (interview) {
      setRating(interview.feedbackRating || 5);
      setNotes(interview.feedbackNotes || '');
    }
  }, [interview]);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Invalid Rating', 'Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    try {
      await atsApi.submitInterviewFeedback(interview.id, {
        feedbackRating: rating,
        feedbackNotes: notes.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ['ats-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      Alert.alert('Saved', 'Scorecard evaluation submitted.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit scorecard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return { text: 'Strong Hire (Exceptional)', color: '#059669', bg: '#ECFDF5' };
      case 4:
        return { text: 'Hire (Meets Requirements)', color: '#0284C7', bg: '#F0F9FF' };
      case 3:
        return { text: 'Neutral (Mixed Signals)', color: '#D97706', bg: '#FFFBEB' };
      case 2:
        return { text: 'No Hire (Skill Gaps)', color: '#EA580C', bg: '#FFF7ED' };
      case 1:
        return { text: 'Strong No Hire (Major Deficits)', color: '#DC2626', bg: '#FEF2F2' };
      default:
        return { text: '', color: COLORS.textSecondary, bg: COLORS.surfaceSecondary };
    }
  };

  const currentVerdict = getRatingLabel(rating);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
          <View style={styles.content}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Interview Scorecard</Text>
                <Text style={styles.candidateName}>
                  {interview.candidate?.firstName} {interview.candidate?.lastName} • {interview.job?.title}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollBody}
            >
              {/* Star Rating Picker */}
              <Text style={styles.label}>Evaluation Verdict</Text>
              <View style={styles.starPickerRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={styles.starTouchable}
                    onPress={() => setRating(star)}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.verdictBadge, { backgroundColor: currentVerdict.bg }]}>
                <Text style={[styles.ratingLabel, { color: currentVerdict.color }]}>
                  {currentVerdict.text}
                </Text>
              </View>

              {/* Feedback Notes */}
              <Text style={styles.label}>Technical & Behavioral Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Document code review, architecture insights, problem-solving depth, and areas for growth..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
            </ScrollView>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isSubmitting}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Scorecard</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: 20,
    maxHeight: '85%',
  },
  scrollBody: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontFamily: FONTS.family,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  candidateName: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 2,
  },
  label: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starTouchable: {
    padding: 4,
  },
  verdictBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginBottom: 14,
  },
  ratingLabel: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
  },
  notesInput: {
    fontFamily: FONTS.family,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    height: 90,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  submitBtn: {
    flex: 2,
    padding: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
