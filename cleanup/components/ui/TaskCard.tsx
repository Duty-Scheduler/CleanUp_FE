import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Assignee {
  id: string;
  name: string;
  avatar?: string;
}

interface TaskCardProps {
  time: string;
  title: string;
  teamName: string;
  teamCode: string;
  assignees: Assignee[];
}

export default function TaskCard({ time, title, teamName, teamCode, assignees }: TaskCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        
        <View style={styles.footer}>
          <View style={styles.avatarRow}>
            {assignees.slice(0, 3).map((assignee, index) => (
              <View key={assignee.id} style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}>
                <Text style={styles.avatarText}>{assignee.name.charAt(0)}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{teamName}</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.code}>{teamCode}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    width: 50,
    paddingTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  cardContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  title: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    fontSize: 12,
    color: '#666',
  },
  codeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  code: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
});
