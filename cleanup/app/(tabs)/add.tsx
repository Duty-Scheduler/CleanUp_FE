

import { taskService } from '@/api/services/tasks';
import { teamService } from '@/api/services/teams';
import DateRow from '@/components/ui/DateRow';
import GroupPicker, { Group } from '@/components/ui/GroupPicker';
import { Member } from '@/components/ui/MemberPicker';
import MonthCalendar from '@/components/ui/MonthCalendar';
import PageHeader from '@/components/ui/PageHeader';
import TimePicker from '@/components/ui/TimePicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddScreen() {
  // expo-router navigation
  // GroupPicker state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  // Group data from API
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  React.useEffect(() => {
    const fetchGroups = async () => {
      setGroupsLoading(true);
      try {
        const teams = await teamService.getAll();
        // Lấy member cho từng team
        const groupList: Group[] = await Promise.all(
          teams.map(async (team: any) => {
            let members: Member[] = [];
            try {
              const teamMembers = await teamService.getMembers(team.id);
              members = teamMembers.map((tm: any) => ({
                id: tm.user?.id || tm.id,
                name: tm.user?.name || 'No name',
              }));
            } catch { }
            return {
              id: team.id,
              name: team.name,
              members,
            };
          })
        );
        setGroups(groupList);
      } catch (e) {
        Alert.alert('Error', 'Failed to load groups');
      } finally {
        setGroupsLoading(false);
      }
    };
    fetchGroups();
  }, []);
  // TimePicker state
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [startHour, setStartHour] = useState(12);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(14);
  const [endMinute, setEndMinute] = useState(0);
  const today = new Date();
  const [selectedStartDate, setSelectedStartDate] = useState(0);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [otherStartDate, setOtherStartDate] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date>(otherStartDate || today);
  const [selectedEndDate, setSelectedEndDate] = useState(0);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [otherEndDate, setOtherEndDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date>(otherEndDate || today);
  const [showMonthPickerStart, setShowMonthPickerStart] = useState(false);
  const [showMonthPickerEnd, setShowMonthPickerEnd] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');

  interface SectionProps {
    title: string;
    children: React.ReactNode;
  }

  const Section = ({ title, children }: SectionProps) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  interface TimeBlockProps {
    label: string;
    value: string;
  }

  const TimeBlock = ({ label, value }: TimeBlockProps) => (
    <View>
      <Text style={styles.timeLabel}>{label}</Text>
      <Text style={styles.timeValue}>{value}</Text>
    </View>
  );

  interface PriorityChipProps {
    label: string;
    color: string;
    active: boolean;
    onPress: () => void;
  }

  const PriorityChip = ({
    label,
    color,
    active,
    onPress,
  }: PriorityChipProps) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.priorityChip,
        { backgroundColor: active ? `${color}22` : '#F5F5F5' },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.priorityText}>{label}</Text>
    </TouchableOpacity>
  );


  const getDates = (base: Date, other: Date | null) => [
    { day: `${base.getDate()}`, label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][base.getDay()] },
    { day: `${(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1)).getDate()}`, label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][(base.getDay() + 1) % 7] },
    { day: `${(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 2)).getDate()}`, label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][(base.getDay() + 2) % 7] },
    other
      ? { day: `${other.getDate()}`, label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][other.getDay()] }
      : { day: 'Other', label: 'Date' },
  ];

  let startDateValue: Date;
  if (selectedStartDate === 3 && otherStartDate) startDateValue = otherStartDate;
  else if (selectedStartDate === 0) startDateValue = today;
  else if (selectedStartDate === 1) startDateValue = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  else startDateValue = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

  const START_DATES = getDates(today, otherStartDate);
  const END_DATES = getDates(startDateValue, otherEndDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title={"Let's set the\nschedule easily"} />

        {/* Select Start Date */}
        <Section title="Select start date">
          <DateRow
            dates={START_DATES}
            selectedIndex={selectedStartDate}
            onSelect={(index) => {
              if (index === 3) {
                setShowStartCalendar(true);
              } else {
                setSelectedStartDate(index);
                if (otherStartDate) setOtherStartDate(null);
              }
            }}
            monthList={[
              today.getMonth(),
              today.getMonth(),
              today.getMonth(),
              otherStartDate ? otherStartDate.getMonth() : today.getMonth()
            ]}
            yearList={[
              today.getFullYear(),
              today.getFullYear(),
              today.getFullYear(),
              otherStartDate ? otherStartDate.getFullYear() : today.getFullYear()
            ]}
          />
          {/* Modal MonthCalendar for Other Start */}
          <Modal
            visible={showStartCalendar}
            transparent
            animationType="fade"
            onRequestClose={() => setShowStartCalendar(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <MonthCalendar
                  selectedDate={tempStartDate}
                  onSelectDate={(date) => setTempStartDate(date)}
                  onSelectMonth={(month, year) => {
                    const newDate = new Date(tempStartDate);
                    newDate.setMonth(month);
                    newDate.setFullYear(year);
                    setTempStartDate(newDate);
                  }}
                  showMonthPicker={showMonthPickerStart}
                  setShowMonthPicker={setShowMonthPickerStart}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setShowStartCalendar(false)} style={styles.modalCancelBtn}>
                    <Text style={styles.modalActionText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setOtherStartDate(tempStartDate);
                    setSelectedStartDate(3);
                    setShowStartCalendar(false);
                  }}>
                    <Text style={styles.modalActionText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </Section>

        {/* Select End Date */}
        <Section title="Select end date">
          <DateRow
            dates={END_DATES}
            selectedIndex={selectedEndDate}
            onSelect={(index) => {
              if (index === 3) {
                setTempEndDate(startDateValue);
                setShowEndCalendar(true);
              } else {
                setSelectedEndDate(index);
                if (otherEndDate) setOtherEndDate(null);
              }
            }}
            monthList={END_DATES.map((item, idx) => {
              if (otherEndDate) return otherEndDate.getMonth();
              return startDateValue.getMonth();
            })}
            yearList={END_DATES.map((item, idx) => {
              if (otherEndDate) return otherEndDate.getFullYear();
              return startDateValue.getFullYear();
            })}
          />
          {/* Modal MonthCalendar for Other End */}
          <Modal
            visible={showEndCalendar}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEndCalendar(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <MonthCalendar
                  selectedDate={tempEndDate}
                  onSelectDate={(date) => setTempEndDate(date)}
                  onSelectMonth={(month, year) => {
                    const newDate = new Date(tempEndDate);
                    newDate.setMonth(month);
                    newDate.setFullYear(year);
                    setTempEndDate(newDate);
                  }}
                  showMonthPicker={showMonthPickerEnd}
                  setShowMonthPicker={setShowMonthPickerEnd}
                  minDate={startDateValue}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setShowEndCalendar(false)} style={styles.modalCancelBtn}>
                    <Text style={styles.modalActionText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    setOtherEndDate(tempEndDate);
                    setSelectedEndDate(3);
                    setShowEndCalendar(false);
                  }}>
                    <Text style={styles.modalActionText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </Section>

        {/* Select Time */}
        <Section title="Select time">
          <View style={styles.timeCard}>
            <TouchableOpacity onPress={() => setShowTimePicker('start')}>
              <TimeBlock label="From" value={`${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`} />
            </TouchableOpacity>
            <Text style={styles.arrow}>›</Text>
            <TouchableOpacity onPress={() => setShowTimePicker('end')}>
              <TimeBlock label="To" value={`${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`} />
            </TouchableOpacity>
          </View>
          {/* TimePicker Modals */}
          <TimePicker
            visible={showTimePicker === 'start'}
            label="Select start time"
            initialHour={startHour}
            initialMinute={startMinute}
            onClose={() => setShowTimePicker(null)}
            onConfirm={(h, m) => {
              setStartHour(h);
              setStartMinute(m);
              setShowTimePicker(null);
            }}
          />
          <TimePicker
            visible={showTimePicker === 'end'}
            label="Select end time"
            initialHour={endHour}
            initialMinute={endMinute}
            onClose={() => setShowTimePicker(null)}
            onConfirm={(h, m) => {
              setEndHour(h);
              setEndMinute(m);
              setShowTimePicker(null);
            }}
          />
        </Section>

        {/* Priority */}
        <Section title="Priority">
          <View style={styles.priorityRow}>
            <PriorityChip
              label="Low"
              color="#4CAF50"
              active={priority === 'low'}
              onPress={() => setPriority('low')}
            />
            <PriorityChip
              label="Medium"
              color="#FFA000"
              active={priority === 'medium'}
              onPress={() => setPriority('medium')}
            />
            <PriorityChip
              label="High"
              color="#F44336"
              active={priority === 'high'}
              onPress={() => setPriority('high')}
            />
          </View>
        </Section>

        {/* People */}
        <Section title="People">
          {groupsLoading ? (
            <Text style={{ color: '#888', marginBottom: 8 }}>Loading groups...</Text>
          ) : groups.length === 0 ? (
            <Text style={{ color: '#888', marginBottom: 8 }}>You have no group. Please join or create a group to add tasks.</Text>
          ) : (
            <TouchableOpacity style={styles.addPeopleBtn} onPress={() => setShowGroupPicker(true)}>
              <Text style={styles.addPeopleText}>+</Text>
            </TouchableOpacity>
          )}
          {/* Hiển thị nhóm và thành viên đã chọn */}
          {selectedGroup && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Group: {selectedGroup.name}</Text>
              {selectedMembers.length > 0 ? (
                <View>
                  <Text style={{ fontWeight: 'bold' }}>Member:</Text>
                  {selectedMembers.map(m => (
                    <Text key={m.id} style={{ marginLeft: 8 }}>{m.name}</Text>
                  ))}
                </View>
              ) : (
                <Text style={{ marginLeft: 8, color: '#888' }}>No members selected</Text>
              )}
            </View>
          )}
          {/* GroupPicker modal */}
          <GroupPicker
            visible={showGroupPicker}
            groups={groups}
            onClose={() => setShowGroupPicker(false)}
            onConfirm={(group, members) => {
              setSelectedGroup(group);
              setSelectedMembers(members);
              setShowGroupPicker(false);
            }}
          />
        </Section>

        {/* Description */}
        <Section title="Title">
          <TextInput
            style={[styles.textArea, { height: 48 }]}
            placeholder="Enter task title"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </Section>
        <Section title="Description">
          <TextInput
            style={styles.textArea}
            placeholder="Add a short description"
            multiline
            value={description}
            onChangeText={setDescription}
            maxLength={500}
          />
        </Section>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            // Reset all form states
            setTitle('');
            setDescription('');
            setSelectedGroup(null);
            setSelectedMembers([]);
            setShowGroupPicker(false);
            setStartHour(12);
            setStartMinute(0);
            setEndHour(14);
            setEndMinute(0);
            setSelectedStartDate(0);
            setShowStartCalendar(false);
            setOtherStartDate(null);
            setTempStartDate(today);
            setSelectedEndDate(0);
            setShowEndCalendar(false);
            setOtherEndDate(null);
            setTempEndDate(today);
            setShowMonthPickerStart(false);
            setShowMonthPickerEnd(false);
            setPriority('low');
            router.replace('/(tabs)');
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, (
            loading ||
            groups.length === 0 ||
            !title.trim() ||
            !selectedGroup ||
            selectedMembers.length === 0
          ) && { backgroundColor: '#BDBDBD' }]}
          disabled={
            loading ||
            groups.length === 0 ||
            !title.trim() ||
            !selectedGroup ||
            selectedMembers.length === 0
          }
          onPress={async () => {
            if (!title.trim()) {
              Alert.alert('Validation', 'Please enter a title');
              return;
            }
            if (groups.length === 0) {
              Alert.alert('Validation', 'You have no group. Please join or create a group to add tasks.');
              return;
            }
            if (!selectedGroup) {
              Alert.alert('Validation', 'Please select a group');
              return;
            }
            if (selectedMembers.length === 0) {
              Alert.alert('Validation', 'Please select at least one member');
              return;
            }
            setLoading(true);
            try {
              // Build request
              const scheduledDate = (otherStartDate || startDateValue).toISOString().slice(0, 10);
              const scheduledTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
              const req = {
                title: title.trim(),
                description: description.trim(),
                teamId: selectedGroup.id,
                assigneeIds: selectedMembers.map(m => m.id),
                scheduledDate,
                scheduledTime,
              };
              await taskService.create(req);
              Alert.alert('Success', 'Task created successfully!');
              // Optionally: reset form or navigate
            } catch (e) {
              Alert.alert('Error', 'Failed to create task.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 20, paddingBottom: 140 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1A1A1A',
  },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 20,
    gap: 16,
  },
  dateCard: {
    width: 80,
    height: 110,
    borderRadius: 20,
    backgroundColor: '#F3F6F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  dateCardActive: { backgroundColor: '#1677FF' },
  dateNumber: { fontSize: 24, fontWeight: '700', color: '#333' },
  dateLabel: { fontSize: 18, color: '#777' },
  dateTextActive: { color: '#FFF' },

  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F6F9',
    borderRadius: 16,
    padding: 20,
  },
  timeLabel: { fontSize: 13, color: '#999' },
  timeValue: { fontSize: 28, fontWeight: '700', color: '#1A1A1A' },
  arrow: { fontSize: 28, color: '#000' },

  priorityRow: { flexDirection: 'row', gap: 12 },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  priorityText: { fontSize: 14, fontWeight: '500' },

  addPeopleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#4F6BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPeopleText: { fontSize: 22, color: '#4F6BFF' },

  textArea: {
    height: 100,
    backgroundColor: '#F3F6F9',
    borderRadius: 16,
    padding: 16,
    textAlignVertical: 'top',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#FFF',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1677FF',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: { color: '#1677FF', fontWeight: '600' },
  saveBtn: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveText: { color: '#FFF', fontWeight: '600' },
  // ...existing styles...
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalCancelBtn: {
    marginRight: 16,
  },
  modalActionText: {
    color: '#1677FF',
    fontWeight: '600',
    fontSize: 16,
  },
});
