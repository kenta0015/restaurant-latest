import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  ScrollView,
} from 'react-native';
import { Clock, Check, X, GripVertical, MessageSquare, TriangleAlert as AlertTriangle, Scale } from 'lucide-react-native';
import { PrepTask, PrepTaskNote, PrepTaskAdjustment } from '@/types/types';
import { formatTime } from '@/utils/prepSheetUtils';

interface PrepTaskItemProps {
  task: PrepTask;
  onComplete: (taskId: string, isCompleted: boolean, completedQuantity: number) => void;
  onAddNote: (taskId: string, note: Omit<PrepTaskNote, 'id' | 'timestamp'>) => void;
  onAdjustCount: (taskId: string, adjustment: Omit<PrepTaskAdjustment, 'id' | 'timestamp'>) => void;
  onReorder?: (taskId: string, direction: 'up' | 'down') => void;
  isDragging?: boolean;
}

export default function PrepTaskItem({
  task,
  onComplete,
  onAddNote,
  onAdjustCount,
  onReorder,
  isDragging,
}: PrepTaskItemProps) {
  // Ensure task.notes is always an array
  const notes = task.notes || [];
  
  const [isEditing, setIsEditing] = useState(false);
  const [completedQuantity, setCompletedQuantity] = useState(
    task.isCompleted ? task.completedQuantity : task.quantity
  );
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(task.quantity.toString());
  const [adjustmentReason, setAdjustmentReason] = useState<PrepTaskAdjustment['reason']>('physical_count');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  const handleToggleComplete = (value: boolean) => {
    setIsCompleted(value);
    if (value && !isEditing) {
      onComplete(task.id, value, task.quantity);
    } else if (!value) {
      onComplete(task.id, false, 0);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    onAddNote(task.id, {
      content: newNote.trim(),
      author: 'Current User', // Replace with actual user
      isUrgent,
    });
    
    setNewNote('');
    setIsUrgent(false);
    setShowNotesModal(false);
  };

  const handleAdjustCount = () => {
    const actualQuantity = parseFloat(adjustmentQuantity);
    if (isNaN(actualQuantity)) return;

    onAdjustCount(task.id, {
      expectedQuantity: task.quantity,
      actualQuantity,
      difference: task.quantity - actualQuantity,
      reason: adjustmentReason,
      notes: adjustmentNotes.trim(),
    });

    setShowAdjustModal(false);
    setAdjustmentQuantity(task.quantity.toString());
    setAdjustmentReason('physical_count');
    setAdjustmentNotes('');
  };

  return (
    <View style={[
      styles.container,
      task.isCompleted && styles.completedContainer,
      isDragging && styles.draggingContainer
    ]}>
      {/* Drag Handle */}
      {onReorder && (
        <View style={styles.dragHandle}>
          <GripVertical color="#666" size={20} />
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.recipeName}>{task.recipeName}</Text>
          <Text style={styles.ingredientName}>{task.ingredientName}</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Clock color="#666" size={14} />
          <Text style={styles.timeText}>{formatTime(task.estimatedTime)}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {/* Notes Indicator */}
        {notes.length > 0 && (
          <View style={styles.notesIndicator}>
            <MessageSquare color="#666" size={16} />
            <Text style={styles.notesCount}>{notes.length}</Text>
          </View>
        )}

        {/* Adjust Count Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowAdjustModal(true)}
        >
          <Scale color="#666" size={16} />
          <Text style={styles.actionButtonText}>Adjust Count</Text>
        </TouchableOpacity>

        {/* Add Note Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowNotesModal(true)}
        >
          <MessageSquare color="#666" size={16} />
          <Text style={styles.actionButtonText}>Add Note</Text>
        </TouchableOpacity>
      </View>

      {/* Notes Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNotesModal}
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Task Notes</Text>
              <TouchableOpacity
                onPress={() => setShowNotesModal(false)}
                style={styles.closeButton}
              >
                <X color="#333" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notesList}>
              {notes.map((note, index) => (
                <View key={note.id} style={styles.noteItem}>
                  {note.isUrgent && (
                    <AlertTriangle color="#FF7F00" size={16} />
                  )}
                  <Text style={styles.noteContent}>{note.content}</Text>
                  <View style={styles.noteMetadata}>
                    <Text style={styles.noteAuthor}>{note.author}</Text>
                    <Text style={styles.noteTimestamp}>
                      {new Date(note.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.addNoteContainer}>
              <TextInput
                style={styles.noteInput}
                value={newNote}
                onChangeText={setNewNote}
                placeholder="Add a note..."
                multiline
              />
              <View style={styles.noteOptions}>
                <View style={styles.urgentContainer}>
                  <Text style={styles.urgentLabel}>Mark as Urgent</Text>
                  <Switch
                    value={isUrgent}
                    onValueChange={setIsUrgent}
                    trackColor={{ false: '#E0E0E0', true: '#FFCDD2' }}
                    thumbColor={isUrgent ? '#FF5252' : '#FFF'}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.addNoteButton, !newNote.trim() && styles.disabledButton]}
                  onPress={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  <Text style={styles.addNoteButtonText}>Add Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

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
                <X color="#333" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.adjustForm}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Expected Quantity:</Text>
                <Text style={styles.formValue}>{task.quantity} {task.unit}</Text>
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Actual Quantity:</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={adjustmentQuantity}
                  onChangeText={setAdjustmentQuantity}
                  keyboardType="numeric"
                  placeholder="Enter actual quantity"
                />
              </View>

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Reason:</Text>
                <View style={styles.reasonButtons}>
                  {['served', 'wastage', 'physical_count', 'other'].map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.reasonButton,
                        adjustmentReason === reason && styles.selectedReasonButton
                      ]}
                      onPress={() => setAdjustmentReason(reason as PrepTaskAdjustment['reason'])}
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

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Notes:</Text>
                <TextInput
                  style={styles.adjustmentNotes}
                  value={adjustmentNotes}
                  onChangeText={setAdjustmentNotes}
                  placeholder="Add any additional notes..."
                  multiline
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!adjustmentQuantity || isNaN(parseFloat(adjustmentQuantity))) && styles.disabledButton
                ]}
                onPress={handleAdjustCount}
                disabled={!adjustmentQuantity || isNaN(parseFloat(adjustmentQuantity))}
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
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedContainer: {
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
  },
  draggingContainer: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.2,
    elevation: 4,
  },
  dragHandle: {
    position: 'absolute',
    left: 8,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B0000',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  notesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notesCount: {
    fontSize: 14,
    color: '#666',
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
    maxHeight: '80%',
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
    padding: 4,
  },
  notesList: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  noteMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteAuthor: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  noteTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  addNoteContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  noteInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  urgentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentLabel: {
    fontSize: 14,
    color: '#666',
  },
  addNoteButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addNoteButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  adjustForm: {
    padding: 16,
  },
  formRow: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  formValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  quantityInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
  adjustmentNotes: {
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
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});