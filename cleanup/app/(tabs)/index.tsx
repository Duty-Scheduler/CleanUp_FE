import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MonthCalendar from '@/components/ui/MonthCalendar';
import TaskCard from '@/components/ui/TaskCard';
import ReminderCard from '@/components/ui/ReminderCard';
import { currentUser, todayTasks, reminders } from '@/data/mockData';

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

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
            <Text style={styles.userName}>{currentUser.name}</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            {currentUser.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{currentUser.name.charAt(0)}</Text>
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
          {todayTasks.map((task) => (
            <TaskCard
              key={task.id}
              time={task.time}
              title={task.title}
              teamName={task.teamName}
              teamCode={task.teamCode}
              assignees={task.assignees}
            />
          ))}
          {todayTasks.length === 0 && (
            <Text style={styles.emptyText}>No tasks scheduled for today</Text>
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
});
