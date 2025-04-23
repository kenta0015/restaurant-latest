import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChefHat } from 'lucide-react-native';
import { PrepTask, PrepTaskNote, PrepTaskAdjustment } from '@/types/types';
import { formatTime } from '@/utils/prepSheetUtils';
import PrepTaskItem from './PrepTaskItem';
import DraggableFlatList, { 
  RenderItemParams,
  ScaleDecorator 
} from 'react-native-draggable-flatlist';

interface RecipeTaskGroupProps {
  recipeName: string;
  tasks: PrepTask[];
  onCompleteTask: (taskId: string, isCompleted: boolean, completedQuantity: number) => void;
  onAddNote: (taskId: string, note: Omit<PrepTaskNote, 'id' | 'timestamp'>) => void;
  onAdjustCount: (taskId: string, adjustment: Omit<PrepTaskAdjustment, 'id' | 'timestamp'>) => void;
  onReorderTasks: (tasks: PrepTask[]) => void;
}

export default function RecipeTaskGroup({
  recipeName,
  tasks = [], // Provide default empty array
  onCompleteTask,
  onAddNote,
  onAdjustCount,
  onReorderTasks,
}: RecipeTaskGroupProps) {
  // Ensure tasks is always an array
  const taskList = Array.isArray(tasks) ? tasks : [];
  
  const totalTime = taskList.reduce((total, task) => total + task.estimatedTime, 0);
  const completedTasks = taskList.filter(task => task.isCompleted).length;

  const renderItem = ({ item, drag, isActive }: RenderItemParams<PrepTask>) => (
    <ScaleDecorator>
      <TouchableOpacity onLongPress={drag} disabled={isActive}>
        <PrepTaskItem
          task={item}
          onComplete={onCompleteTask}
          onAddNote={onAddNote}
          onAdjustCount={onAdjustCount}
          isDragging={isActive}
        />
      </TouchableOpacity>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ChefHat color="#8B0000" size={20} />
          <Text style={styles.title}>{recipeName}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {completedTasks}/{taskList.length} tasks • {formatTime(totalTime)}
          </Text>
        </View>
      </View>
      
      <DraggableFlatList
        data={taskList}
        onDragEnd={({ data }) => onReorderTasks(data)}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
});