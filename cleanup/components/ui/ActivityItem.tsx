import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActivityItemProps {
  type: 'completed' | 'joined' | 'created';
  title: string;
  subtitle: string;
  time: string;
}

export default function ActivityItem({ type, title, subtitle, time }: ActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'completed':
        return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'joined':
        return { name: 'people', color: '#2196F3' };
      case 'created':
        return { name: 'add-circle', color: '#FF9800' };
      default:
        return { name: 'ellipse', color: '#999' };
    }
  };

  const icon = getIcon();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
        <Ionicons name={icon.name as any} size={20} color={icon.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});
