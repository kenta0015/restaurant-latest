import React from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { PrepSheet } from '@/types/types';
import { formatTime } from '@/utils/prepSheetUtils';

interface PrepSheetSummaryProps {
  prepSheet: PrepSheet;
  onPrint?: () => void;
}

export default function PrepSheetSummary({ prepSheet, onPrint }: PrepSheetSummaryProps) {
  // 安全チェック
  if (!prepSheet?.tasks || prepSheet.tasks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No tasks available for this prep sheet.</Text>
      </View>
    );
  }

  const completedTasks = prepSheet.tasks.filter(task => task.isCompleted).length;
  const totalTasks = prepSheet.tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const remainingTime = prepSheet.tasks
    .filter(task => !task.isCompleted)
    .reduce((total, task) => total + task.estimatedTime, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prep Summary</Text>
        <Text style={styles.date}>
          {prepSheet.weekday}, {prepSheet.date}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <CheckCircle color="#4CAF50" size={20} />
          </View>
          <View>
            <Text style={styles.statValue}>{completedTasks}/{totalTasks}</Text>
            <Text style={styles.statLabel}>Tasks Completed</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Clock color="#FF9800" size={20} />
          </View>
          <View>
            <Text style={styles.statValue}>{formatTime(remainingTime)}</Text>
            <Text style={styles.statLabel}>Remaining Time</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <AlertCircle color="#8B0000" size={20} />
          </View>
          <View>
            <Text style={styles.statValue}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${completionPercentage}%` }
          ]} 
        />
      </View>

      <View style={styles.totalTimeContainer}>
        <Text style={styles.totalTimeLabel}>Total Estimated Time:</Text>
        <Text style={styles.totalTimeValue}>{formatTime(prepSheet.totalEstimatedTime)}</Text>
      </View>

      {onPrint && (
        <TouchableOpacity style={styles.printButton} onPress={onPrint}>
          <Text style={styles.printButtonText}>Print Prep Sheet</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  totalTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalTimeLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  printButton: {
    backgroundColor: '#8B0000',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  printButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
