import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Save,
  RefreshCw,
  Timer,
} from 'lucide-react-native';
import {
  PrepSheet,
  PrepTask,
  InventoryItem,
} from '@/types/types';
import {
  prepSheetData,
  recipeData,
  inventoryData,
} from '@/data/dummyData';
import {
  updateTaskCompletion,
  updateInventoryFromCompletedTasks,
  groupTasksByRecipe,
  formatTime,
} from '@/utils/prepSheetUtils';
import PrepSheetSummary from '@/components/PrepSheetSummary';
import RecipeTaskGroup from '@/components/RecipeTaskGroup';

const defaultPrepSheet: PrepSheet = {
  id: '',
  weekday: '',
  date: '',
  totalEstimatedTime: 0,
  tasks: [],
  status: 'in-progress',
};

export default function PrepSheetScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prepSheet, setPrepSheet] = useState<PrepSheet>(defaultPrepSheet);
  const [inventory, setInventory] = useState<InventoryItem[]>(inventoryData);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>('');

  useEffect(() => {
    setPrepSheet(prepSheetData);
  }, []);

  const tasksByRecipe = groupTasksByRecipe(prepSheet.tasks);
  const completedTasks = prepSheet.tasks.filter(task => task.isCompleted).length;
  const totalTasks = prepSheet.tasks.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCompleteTask = (
    taskId: string,
    isCompleted: boolean,
    completedQuantity: number
  ) => {
    const updatedPrepSheet = updateTaskCompletion(
      prepSheet,
      taskId,
      isCompleted,
      completedQuantity
    );
    setPrepSheet(updatedPrepSheet);

    if (isCompleted) {
      const completedTask = updatedPrepSheet.tasks.find(task => task.id === taskId);
      if (completedTask) {
        const updatedInventory = updateInventoryFromCompletedTasks(
          inventory,
          [completedTask]
        );
        setInventory(updatedInventory);
      }
    }
  };

  const handleSaveAll = () => {
    setLoading(true);
    setTimeout(() => {
      const completedTasks = prepSheet.tasks.filter(task => task.isCompleted);
      const updatedInventory = updateInventoryFromCompletedTasks(inventory, completedTasks);
      setInventory(updatedInventory);
      setLoading(false);
      Alert.alert("Prep Sheet Saved", `${completedTasks.length} tasks saved and inventory updated.`);
    }, 1000);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setPrepSheet(prepSheetData);
      setInventory(inventoryData);
      setLoading(false);
    }, 1000);
  };

  const handleUpdateTime = (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = prepSheet.tasks.find(t => t.id === taskId);
    if (task) {
      setEstimatedTime(task.estimatedTime.toString());
      setTimeModalVisible(true);
    }
  };

  const saveUpdatedTime = () => {
    if (!selectedTaskId) return;
    const time = parseInt(estimatedTime);
    if (isNaN(time) || time <= 0) {
      Alert.alert("Invalid Time", "Please enter a valid number.");
      return;
    }
    const updatedTasks = prepSheet.tasks.map(task =>
      task.id === selectedTaskId ? { ...task, estimatedTime: time } : task
    );
    const totalEstimatedTime = updatedTasks.reduce((total, task) => total + task.estimatedTime, 0);
    setPrepSheet({ ...prepSheet, tasks: updatedTasks, totalEstimatedTime });
    setTimeModalVisible(false);
    setSelectedTaskId(null);
  };

  const handlePrint = () => {
    Alert.alert("Print", "This would send the prep sheet to a printer or create a PDF.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar color="#666" size={18} />
          <Text style={styles.dateText}>
            {prepSheet.weekday}, {prepSheet.date}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh} disabled={loading}>
          <RefreshCw color="#666" size={18} />
          <Text style={styles.refreshText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <PrepSheetSummary prepSheet={prepSheet} onPrint={handlePrint} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Prep Tasks</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{completionPercentage}% Complete</Text>
          </View>
        </View>

        {Object.entries(tasksByRecipe).map(([recipeId, tasks]) => (
          <RecipeTaskGroup
            key={recipeId}
            recipeName={tasks[0].recipeName}
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            onAddNote={() => {}}
            onAdjustCount={() => {}}
            onReorderTasks={() => {}}
          />
        ))}

        {prepSheet.tasks.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No prep tasks for today</Text>
            <Text style={styles.emptySubText}>Go to Prep Suggestions to generate tasks</Text>
          </View>
        )}
      </ScrollView>

      {prepSheet.tasks.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSaveAll}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Save color="#FFF" size={20} />
                <Text style={styles.saveButtonText}>Save & Update Inventory</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={timeModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#FFF', padding: 20, borderRadius: 8, width: '80%' }}>
            <Text style={{ marginBottom: 10 }}>Update Estimated Time</Text>
            <TextInput
              style={{ borderWidth: 1, padding: 10, borderRadius: 6 }}
              keyboardType="numeric"
              value={estimatedTime}
              onChangeText={setEstimatedTime}
            />
            <TouchableOpacity onPress={saveUpdatedTime}>
              <Text style={{ marginTop: 10, color: 'blue', textAlign: 'center' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontSize: 16, color: '#333', fontWeight: '500' },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  refreshText: { fontSize: 14, color: '#666' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  progressBadge: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  progressText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginTop: 20,
  },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#999', textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  disabledButton: { backgroundColor: '#A5D6A7' },
});
