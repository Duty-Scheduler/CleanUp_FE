import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const DATE_ITEM_WIDTH = 50;

interface DateItem {
  day: number;
  dayName: string;
  date: Date;
}

interface MonthCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectMonth: (month: number, year: number) => void;
  showMonthPicker: boolean;
  setShowMonthPicker: (show: boolean) => void;
  minDate?: Date;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthCalendar({
  selectedDate,
  onSelectDate,
  onSelectMonth,
  showMonthPicker,
  setShowMonthPicker,
  minDate,
}: MonthCalendarProps) {
  const scrollRef = useRef<ScrollView>(null);
  const today = new Date();

  // Get all dates for the selected month
  const getDatesInMonth = (): DateItem[] => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates: DateItem[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (minDate && date <= minDate) continue;
      dates.push({
        day,
        dayName: DAY_NAMES[date.getDay()].substring(0, 2),
        date,
      });
    }
    return dates;
  };

  const dates = getDatesInMonth();

  // Scroll to selected date
  useEffect(() => {
    const index = selectedDate.getDate() - 1;
    const offset = Math.max(0, index * DATE_ITEM_WIDTH - width / 2 + DATE_ITEM_WIDTH / 2);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: offset, animated: true });
    }, 100);
  }, [selectedDate.getMonth()]);

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const currentYear = selectedDate.getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <View style={styles.container}>
      {/* Month Selector */}
      <TouchableOpacity
        style={styles.monthSelector}
        onPress={() => setShowMonthPicker(true)}
      >
        <Text style={styles.monthText}>
          {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#666" />
      </TouchableOpacity>

      {/* Scrollable Dates */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesContainer}
      >
        {dates.map((item) => {
          const disabled = minDate && item.date <= minDate;
          return (
            <TouchableOpacity
              key={item.day}
              style={[
                styles.dateItem,
                isSelected(item.date) && styles.selectedDate,
                isToday(item.date) && !isSelected(item.date) && styles.todayDate,
                disabled && { opacity: 0.4 }
              ]}
              onPress={() => {
                if (!disabled) onSelectDate(item.date);
              }}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.dayNumber,
                  isSelected(item.date) && styles.selectedText,
                  disabled && { color: '#bbb' }
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dayName,
                  isSelected(item.date) && styles.selectedDayName,
                  disabled && { color: '#bbb' }
                ]}
              >
                {item.dayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Month</Text>

            {/* Year Tabs */}
            <View style={styles.yearTabs}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearTab,
                    selectedDate.getFullYear() === year && styles.activeYearTab,
                  ]}
                  onPress={() => onSelectMonth(selectedDate.getMonth(), year)}
                >
                  <Text
                    style={[
                      styles.yearText,
                      selectedDate.getFullYear() === year && styles.activeYearText,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Month Grid */}
            <View style={styles.monthGrid}>
              {MONTHS.map((month, index) => {
                let disabled = false;
                if (minDate) {
                  const year = selectedDate.getFullYear();
                  if (year < minDate.getFullYear()) disabled = true;
                  else if (year === minDate.getFullYear() && index < minDate.getMonth()) disabled = true;
                }
                if (disabled) return null;
                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthItem,
                      selectedDate.getMonth() === index && styles.selectedMonth,
                    ]}
                    onPress={() => {
                      onSelectMonth(index, selectedDate.getFullYear());
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthItemText,
                        selectedDate.getMonth() === index && styles.selectedMonthText,
                      ]}
                    >
                      {month.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  monthText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  datesContainer: {
    paddingRight: 20,
  },
  dateItem: {
    width: DATE_ITEM_WIDTH,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 4,
  },
  selectedDate: {
    backgroundColor: '#2196F3',
  },
  todayDate: {
    backgroundColor: '#E3F2FD',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  yearTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  yearTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeYearTab: {
    backgroundColor: '#2196F3',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeYearText: {
    color: '#FFF',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthItem: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedMonth: {
    backgroundColor: '#E3F2FD',
  },
  monthItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedMonthText: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
