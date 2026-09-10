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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { atsApi } from '../../api/ats.api';
import { Interview } from '../../types/ats.types';

interface SubmitFeedbackModalProps {
  visible: boolean;
  interview: Interview;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({
  visible,
  interview,
  onClose,
  onSuccess,
}) => {
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
      Alert.alert('Scorecard Saved', 'Interview evaluation submitted successfully.');
      onSuccess();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit scorecard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return 'Strong Hire (Exceptional)';
      case 4:
        return 'Hire (Meets Requirements)';
      case 3:
        return 'Neutral (Mixed Signals)';
      case 2:
        return 'No Hire (Gaps Identified)';
      case 1:
        return 'Strong No Hire (Major Deficits)';
      default:
        return '';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Interview Scorecard</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.candidateName}>
            Candidate: {interview.candidate?.firstName} {interview.candidate?.lastName}
          </Text>
          <Text style={styles.jobTitle}>Role: {interview.job?.title}</Text>

          {/* Star Rating Picker */}
          <Text style={styles.label}>Evaluation Rating</Text>
          <View style={styles.starPickerRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starTouchable}
                onPress={() => setRating(star)}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>

          {/* Feedback Notes */}
          <Text style={styles.label}>Technical / Behavioral Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Document candidate strengths, coding assessment, architecture review, and potential areas for growth..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
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
                <Text style={styles.submitBtnText}>Save Evaluation</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  jobTitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  starTouchable: {
    padding: 6,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 90,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
