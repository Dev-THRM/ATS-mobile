import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { Interview } from '../../types/ats.types';
import { COLORS, SHADOWS, RADIUS, FONTS } from '../../theme/theme';
import { useKeyboardShift } from '../../hooks/useKeyboardShift';

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
  const scrollViewRef = useRef<ScrollView>(null);
  const { keyboardHeight, isKeyboardOpen, maxModalHeight, onInputFocus } = useKeyboardShift();
  const [rating, setRating] = useState<number>(interview.feedbackRating || 5);
  const [notes, setNotes] = useState<string>(interview.feedbackNotes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (interview) {
      setRating(interview.feedbackRating || 5);
      setNotes(interview.feedbackNotes || '');
    }
  }, [interview]);

  useEffect(() => {
    if (isKeyboardOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isKeyboardOpen]);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Invalid Rating', 'Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    try {
      await atsApi.submitInterviewFeedback(interview.id, {
        rating,
        notes: notes.trim(),
        feedbackRating: rating,
        feedbackNotes: notes.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ['ats-interviews'] });
      queryClient.invalidateQueries({ queryKey: ['ats-dashboard'] });
      Alert.alert('Success', 'Scorecard evaluation submitted successfully.', [
        {
          text: 'OK',
          onPress: () => {
            if (onSuccess) onSuccess();
            onClose();
          },
        },
      ]);
    } catch (err: any) {
      const raw = err.response?.data?.message || err.message || 'Failed to submit scorecard.';
      const safe = Array.isArray(raw) ? raw.join('\n') : String(raw);
      Alert.alert('Submission Error', safe);
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.overlay, { paddingBottom: keyboardHeight }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.content, { maxHeight: maxModalHeight }]}>
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.title}>Interview Scorecard</Text>
              <Text style={styles.candidateName} numberOfLines={1}>
                {interview.candidate?.firstName} {interview.candidate?.lastName} • {interview.job?.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
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
                  activeOpacity={0.7}
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
              placeholder="Document code review, architecture insights, depth, and growth areas..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              selectionColor={COLORS.primary}
              cursorColor={COLORS.primary}
              onFocus={() => {
                onInputFocus();
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 60);
              }}
            />

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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    width: '100%',
    ...SHADOWS.lg,
  },
  scrollBody: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: FONTS.family,
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  candidateName: {
    fontFamily: FONTS.family,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    fontFamily: FONTS.family,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starTouchable: {
    padding: 6,
  },
  verdictBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    fontFamily: FONTS.input,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.sm,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
    minHeight: 90,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  submitBtnText: {
    fontFamily: FONTS.family,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
