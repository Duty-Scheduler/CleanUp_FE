import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import { taskService, MyTaskByDate } from '@/api';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Format date to YYYY-MM-DD
const formatDateToAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CalendarScreen() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<MyTaskByDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch tasks for selected date
  const fetchTasksByDate = useCallback(async (date: Date) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const dateStr = formatDateToAPI(date);
      const response = await taskService.getMyTasksByDate(dateStr);
      setTasks(response.tasks || []);
    } catch (error) {
      console.log('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  // Fetch tasks when selected date changes
  useEffect(() => {
    fetchTasksByDate(selectedDate);
  }, [selectedDate, fetchTasksByDate]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasksByDate(selectedDate);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  // Render calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <View key={`prev-${i}`} style={styles.dayCell}>
          <Text style={styles.dayTextOther}>{prevMonthDays - i}</Text>
        </View>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const selected = isSelected(day);
      const today = isToday(day);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            selected && styles.selectedDay,
            today && !selected && styles.todayDay,
          ]}
          onPress={() => selectDate(day)}
        >
          <Text style={[
            styles.dayText,
            selected && styles.selectedDayText,
            today && !selected && styles.todayDayText,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    // Next month days
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <View key={`next-${i}`} style={styles.dayCell}>
          <Text style={styles.dayTextOther}>{i}</Text>
        </View>
      );
    }
    
    return days;
  };

  // Calculate completion stats
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format selected date for display
  const formatSelectedDate = () => {
    return `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Duty Tasks</Text>
            <Text style={styles.headerSubtitle}>Manage your daily tasks</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/add')}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add task</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Ionicons name="calendar-outline" size={20} color="#333" />
            <Text style={styles.calendarTitle}>Task Calendar</Text>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View style={styles.daysHeader}>
            {DAYS.map((day) => (
              <View key={day} style={styles.dayHeaderCell}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {renderCalendar()}
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <View>
              <Text style={styles.selectedDateText}>{formatSelectedDate()}</Text>
              <Text style={styles.tasksCount}>
                {completedTasks}/{totalTasks} tasks completed
              </Text>
            </View>
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>{completionRate}%</Text>
              <Text style={styles.completionLabel}>Complete</Text>
            </View>
          </View>

          {/* Task List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <TouchableOpacity style={styles.checkbox}>
                    {task.status === 'completed' ? (
                      <Ionicons name="checkbox" size={24} color="#4CAF50" />
                    ) : (
                      <Ionicons name="square-outline" size={24} color="#CCC" />
                    )}
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, task.status === 'completed' && styles.taskTitleCompleted]}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text style={styles.taskDescription} numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.statusBadge, task.status === 'completed' ? styles.statusDone : styles.statusPending]}>
                    <Text style={[styles.statusText, task.status === 'completed' ? styles.statusDoneText : styles.statusPendingText]}>
                      {task.status === 'completed' ? 'Done' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* Assigned Users */}
                {task.Users && task.Users.length > 0 && (
                  <View style={styles.assigneesSection}>
                    <Text style={styles.assigneesLabel}>Assigned to:</Text>
                    <View style={styles.assigneesList}>
                      {task.Users.map((user) => (
                        <View key={user.id} style={styles.assigneeChip}>
                          {user.avatar ? (
                            <Image source={{ uri: user.avatar }} style={styles.assigneeAvatar} />
                          ) : (
                            <View style={styles.assigneePlaceholder}>
                              <Text style={styles.assigneeInitial}>{user.name?.charAt(0)}</Text>
                            </View>
                          )}
                          <Text style={styles.assigneeName}>{user.name}</Text>
                          {user.TaskUser?.penalty_status && user.TaskUser.penalty_status !== 'none' && (
                            <Ionicons name="warning" size={12} color="#F44336" />
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Proof Image */}
                {task.proof && (
                  <View style={styles.proofSection}>
                    <Text style={styles.proofLabel}>Proof submitted</Text>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  </View>
                )}

                {/* Task Actions */}
                <View style={styles.taskActions}>
                  <TouchableOpacity style={styles.taskAction}>
                    <Ionicons name="create-outline" size={18} color="#2196F3" />
                    <Text style={styles.taskActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.taskAction}>
                    <Ionicons name="trash-outline" size={18} color="#F44336" />
                    <Text style={[styles.taskActionText, { color: '#F44336' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#DDD" />
              <Text style={styles.emptyTitle}>No tasks for this date</Text>
              <Text style={styles.emptySubtitle}>
                Select another date or add new tasks
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  calendarCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextOther: {
    fontSize: 14,
    color: '#CCC',
  },
  selectedDay: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFF',
    fontWeight: '600',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 20,
  },
  todayDayText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  tasksSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tasksCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  completionBadge: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  completionLabel: {
    fontSize: 10,
    color: '#2196F3',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  taskCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDone: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusDoneText: {
    color: '#4CAF50',
  },
  statusPendingText: {
    color: '#FF9800',
  },
  assigneesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  assigneesLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  assigneesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assigneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 6,
  },
  assigneeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  assigneePlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  assigneeName: {
    fontSize: 12,
    color: '#333',
  },
  proofSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  proofLabel: {
    fontSize: 12,
    color: '#4CAF50',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  taskAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskActionText: {
    fontSize: 13,
    color: '#2196F3',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 4,
    textAlign: 'center',
  },
});
