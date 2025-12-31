import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DateItem {
  day: number;
  dayName: string;
  isToday: boolean;
}

interface WeekCalendarProps {
  dates: DateItem[];
  selectedDate: number;
  onSelectDate: (day: number) => void;
  month: string;
}

export default function WeekCalendar({ dates, selectedDate, onSelectDate, month }: WeekCalendarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.monthRow}>
        <Text style={styles.month}>{month}</Text>
      </View>
      <View style={styles.datesRow}>
        {dates.map((item) => (
          <TouchableOpacity
            key={item.day}
            style={[styles.dateItem, selectedDate === item.day && styles.selectedDate]}
            onPress={() => onSelectDate(item.day)}
          >
            <Text style={[styles.dayNumber, selectedDate === item.day && styles.selectedText]}>
              {item.day}
            </Text>
            <Text style={[styles.dayName, selectedDate === item.day && styles.selectedDayName]}>
              {item.dayName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  month: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  selectedDate: {
    backgroundColor: '#2196F3',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  selectedText: {
    color: '#FFF',
  },
  dayName: {
    fontSize: 12,
    color: '#999',
  },
  selectedDayName: {
    color: '#FFF',
  },
});
