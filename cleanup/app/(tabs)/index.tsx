import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MonthCalendar from '@/components/ui/MonthCalendar';
import ReminderCard from '@/components/ui/ReminderCard';
import { reminders } from '@/data/mockData';
import { useAppSelector } from '@/store/hooks';
import { taskService, UserTask } from '@/api';

const MAX_TASKS_DISPLAY = 2;

export default function HomeScreen() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalTasks, setTotalTasks] = useState(0);

  // Fetch all my tasks
  const fetchMyTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await taskService.getMyTasks();
      setTasks(response.tasks || []);
      setTotalTasks(response.total || 0);
    } catch (error) {
      console.log('Failed to fetch tasks:', error);
      setTasks([]);
      setTotalTasks(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMyTasks();
    }, [fetchMyTasks])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSelectMonth = (month: number, year: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(month);
    newDate.setFullYear(year);
    setSelectedDate(newDate);
  };

  const handleViewMore = () => {
    router.push('/(tabs)/calendar');
  };

  const handleTaskPress = (task: UserTask) => {
    // Navigate to task detail with groupId from Group
    if (task.Group?.id) {
      router.push({
        pathname: '/task-detail',
        params: {
          groupId: task.Group.id,
          taskId: task.id,
          groupName: task.Group.title,
        },
      });
    }
  };

  // Get only first 2 tasks to display
  const displayedTasks = tasks.slice(0, MAX_TASKS_DISPLAY);
  const hasMoreTasks = totalTasks > MAX_TASKS_DISPLAY;

  const userName = user?.name || 'User';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Month Calendar */}
        <MonthCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onSelectMonth={handleSelectMonth}
          showMonthPicker={showMonthPicker}
          setShowMonthPicker={setShowMonthPicker}
        />

        {/* Schedule Today */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule Today</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2196F3" />
            </View>
          ) : displayedTasks.length > 0 ? (
            <>
              {displayedTasks.map((task) => (
                <TouchableOpacity 
                  key={task.id} 
                  style={styles.taskItem}
                  onPress={() => handleTaskPress(task)}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskStatusIndicator}>
                    {task.status ? (
                      <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={20} color="#FF9800" />
                    )}
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, task.status && styles.taskTitleCompleted]}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text style={styles.taskDescription} numberOfLines={1}>
                        {task.description}
                      </Text>
                    )}
                    {task.Group && (
                      <View style={styles.taskGroupBadge}>
                        <Ionicons name="people-outline" size={12} color="#666" />
                        <Text style={styles.taskGroupName}>{task.Group.title}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.taskStatusBadge, task.status ? styles.statusDone : styles.statusPending]}>
                    <Text style={[styles.taskStatusText, task.status ? styles.statusDoneText : styles.statusPendingText]}>
                      {task.status ? 'Done' : 'Pending'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {hasMoreTasks && (
                <TouchableOpacity style={styles.viewMoreButton} onPress={handleViewMore}>
                  <Text style={styles.viewMoreText}>View more</Text>
                  <Ionicons name="chevron-forward" size={16} color="#2196F3" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>No tasks assigned to you</Text>
          )}
        </View>

        {/* Reminder */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reminder</Text>
            <Text style={styles.sectionSubtitle}>Don't forget schedule</Text>
          </View>
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              title={reminder.title}
              time={reminder.time}
              color={reminder.color}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  taskStatusIndicator: {
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  taskDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  taskGroupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskGroupName: {
    fontSize: 12,
    color: '#666',
  },
  taskStatusBadge: {
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
  taskStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusDoneText: {
    color: '#4CAF50',
  },
  statusPendingText: {
    color: '#FF9800',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginRight: 4,
  },
});
