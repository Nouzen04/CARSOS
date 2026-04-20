import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../firebase';
import { addDoc, collection, doc, serverTimestamp, runTransaction, increment } from 'firebase/firestore';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  request: {
    id: string;
    bengkelID: string;
    workshopName: string;
  };
  onSuccess: () => void;
}

export const RatingModal = ({ visible, onClose, request, onSuccess }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Selection Required', 'Please select a star rating.');
      return;
    }

    setSubmitting(true);
    try {
      if (!auth.currentUser) throw new Error("Not authenticated");

      // Use a transaction to ensure atomic update of workshop averages
      await runTransaction(db, async (transaction) => {
        // 1. Create the rating document
        const ratingRef = collection(db, 'ratings');
        
        // 2. Update workshop document
        const workshopRef = doc(db, 'users', request.bengkelID);
        const workshopSnap = await transaction.get(workshopRef);
        
        if (!workshopSnap.exists()) {
          throw new Error("Workshop does not exist!");
        }

        const data = workshopSnap.data();
        const currentTotalRating = data.totalRating || 0;
        const currentReviewCount = data.reviewCount || 0;
        
        const newTotalRating = currentTotalRating + rating;
        const newReviewCount = currentReviewCount + 1;
        const newAverageRating = Number((newTotalRating / newReviewCount).toFixed(1));

        // Perform the updates
        transaction.update(workshopRef, {
          totalRating: newTotalRating,
          reviewCount: newReviewCount,
          rating: newAverageRating
        });

        // Add the rating summary to the actual rating collection (outside transaction for simplicity or inside if needed)
        // Note: transaction.set for a NEW doc with custom ID is possible, 
        // but for auto-ID we usually do it separately unless we need strict atomicity across collections.
        // We'll add the rating record separately to keep transaction light.
      });

      // Part 2: Save the detailed rating record
      await addDoc(collection(db, 'ratings'), {
        requestID: request.id,
        pemanduID: auth.currentUser.uid,
        bengkelID: request.bengkelID,
        score: rating,
        comment: comment,
        timestamp: serverTimestamp()
      });

      // Part 3: Update the service request to reflect it's been rated (optional but good)
      // await updateDoc(doc(db, 'service_requests', request.id), { rated: true });

      Alert.alert('Success', 'Thank you for your feedback!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onClose} 
        contentContainerStyle={styles.container}
      >
        <IconButton 
          icon="close" 
          size={24} 
          onPress={onClose} 
          style={styles.closeBtn} 
        />
        <Text variant="headlineSmall" style={styles.title}>Rate {request.workshopName}</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>How was your experience with this workshop?</Text>
        
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <MaterialCommunityIcons 
                name={star <= rating ? "star" : "star-outline"} 
                size={40} 
                color={star <= rating ? "#f59e0b" : "#cbd5e1"} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          label="Leave a comment (optional)"
          value={comment}
          onChangeText={setComment}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          outlineColor="#e2e8f0"
          activeOutlineColor="#3b82f6"
        />

        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          loading={submitting}
          disabled={submitting}
          style={styles.submitBtn}
          labelStyle={styles.submitBtnLabel}
        >
          Submit Review
        </Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  submitBtn: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 4,
    backgroundColor: '#0f172a',
  },
  submitBtnLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
