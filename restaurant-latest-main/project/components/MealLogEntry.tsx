import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Calendar, Clock, Trash2, Scale, History } from 'lucide-react-native';
import { MealLog, MealCountAdjustment } from '@/types/types';

interface MealLogEntryProps {
  mealLog: MealLog;
  onDelete: () => void;
  onAdjustCount: (logId: string, adjustment: Omit<MealCountAdjustment, 'id' | 'timestamp'>) => void;
}

export default function MealLogEntry({ mealLog, onDelete, onAdjustCount }: MealLogEntryProps) {
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [remainingCount, setRemainingCount] = useState(mealLog.currentCount.toString());
  const [adjustmentReason, setAdjustmentReason] = useState<MealCountAdjustment['reason']>('physical_count');
  const [notes, setNotes] = useState('');

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleAdjustCount = () => {
    const newCount = parseFloat(remainingCount);
    if (isNaN(newCount)) return;

    onAdjustCount(mealLog.id, {
      initialCount: mealLog.currentCount,
      remainingCount: newCount,
      difference: mealLog.currentCount - newCount,
      reason: adjustmentReason,
      notes: notes.trim() || null
    });

    setShowAdjustModal(false);
    setRemainingCount(mealLog.currentCount.toString());
    setAdjustmentReason('physical_count');
    setNotes('');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.recipeName}>{mealLog.recipe.name}</Text>
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityText}>
            {mealLog.currentCount}/{mealLog.quantity} remaining
          </Text>
        </View>
      </View>
      
      <View style={styles.dateTimeRow}>
        <View style={styles.dateContainer}>
          <Calendar color="#666" size={14} />
          <Text style={styles.dateText}>{formatDate(mealLog.date)}</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Clock color="#666" size={14} />
          <Text style={styles.timeText}>{formatTime(mealLog.date)}</Text>
        </View>
      </View>
      
      <View style={styles.categoryRow}>
        <Text style={styles.categoryLabel}>Recipe Category:</Text>
        <Text style={styles.categoryText}>{mealLog.recipe.category}</Text>
      </View>
      
      {mealLog.notes && (
        <Text style={styles.notes}>{mealLog.notes}</Text>
      )}
      
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.adjustButton}
          onPress={() => setShowAdjustModal(true)}
        >
          <Scale color="#666" size={18} />
          <Text style={styles.adjustButtonText}>Adjust Count</Text>
        </TouchableOpacity>

        {mealLog.adjustments.length > 0 && (
          <View style={styles.adjustmentIndicator}>
            <History color="#666" size={14} />
            <Text style={styles.adjustmentCount}>
              {mealLog.adjustments.length} adjustments
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={onDelete}
      >
        <Trash2 color="#FF5252" size={18} />
      </TouchableOpacity>

      {/* Adjust Count Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAdjustModal}
        onRequestClose={() => setShowAdjustModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adjust Meal Count</Text>
              <TouchableOpacity 
                onPress={() => setShowAdjustModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.countRow}>
                <Text style={styles.countLabel}>Initial Count:</Text>
                <Text style={styles.countValue}>{mealLog.currentCount}</Text>
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Remaining Count:</Text>
                <TextInput
                  style={styles.countInput}
                  value={remainingCount}
                  onChangeText={setRemainingCount}
                  keyboardType="numeric"
                  placeholder="Enter remaining count"
                />
              </View>

              <View style={styles.reasonContainer}>
                <Text style={styles.reasonLabel}>Reason:</Text>
                <View style={styles.reasonButtons}>
                  {['served', 'wastage', 'physical_count'].map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.reasonButton,
                        adjustmentReason === reason && styles.selectedReasonButton
                      ]}
                      onPress={() => setAdjustmentReason(reason as MealCountAdjustment['reason'])}
                    >
                      <Text style={[
                        styles.reasonButtonText,
                        adjustmentReason === reason && styles.selectedReasonButtonText
                      ]}>
                        {reason.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any additional notes..."
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!remainingCount || isNaN(parseFloat(remainingCount))) && styles.disabledButton
                ]}
                onPress={handleAdjustCount}
                disabled={!remainingCount || isNaN(parseFloat(remainingCount))}
              >
                <Text style={styles.submitButtonText}>Save Adjustment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  quantityBadge: {
    backgroundColor: '#8B0000',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  quantityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  adjustButtonText: {
    fontSize: 14,
    color: '#666',
  },
  adjustmentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adjustmentCount: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
  modalBody: {
    padding: 16,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  countLabel: {
    fontSize: 16,
    color: '#666',
  },
  countValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  inputRow: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  countInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  reasonContainer: {
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  reasonButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedReasonButton: {
    backgroundColor: '#8B0000',
  },
  reasonButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedReasonButtonText: {
    color: '#FFF',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#8B0000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
});