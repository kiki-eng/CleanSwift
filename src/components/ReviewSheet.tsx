import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Input } from './Input';
import { RatingInput } from './RatingInput';

interface ReviewSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
  pending: boolean;
  errorMessage?: string;
}

/** Star rating + comment form used after completed jobs/bookings. */
export function ReviewSheet({
  visible,
  onClose,
  onSubmit,
  pending,
  errorMessage,
}: ReviewSheetProps): React.JSX.Element {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Leave a review">
      <Text style={styles.prompt}>How was the cleaning?</Text>
      <RatingInput value={rating} onChange={setRating} />
      <Input
        label="Comment (optional)"
        value={comment}
        onChangeText={setComment}
        placeholder="Share details of your experience"
        multiline
        style={styles.comment}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Button
        title="Submit Review"
        onPress={() => onSubmit(rating, comment.trim() || undefined)}
        disabled={rating === 0}
        loading={pending}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  prompt: {
    ...typography.bodyLg,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  comment: { minHeight: 72, textAlignVertical: 'top' },
  error: {
    ...typography.body,
    color: colors.danger,
    marginBottom: spacing.lg,
  },
});
