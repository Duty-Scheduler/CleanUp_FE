import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TeamCardProps {
  name: string;
  description: string;
  memberCount: number;
  code: string;
  isOwner?: boolean;
  onSettingsPress?: () => void;
  onPress?: () => void;
}

export default function TeamCard({
  name,
  description,
  memberCount,
  code,
  isOwner,
  onSettingsPress,
  onPress,
}: TeamCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{name}</Text>
          {isOwner && <Text style={styles.crown}>👑</Text>}
        </View>
        <TouchableOpacity onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{description}</Text>

      <View style={styles.footer}>
        <View style={styles.memberInfo}>
          <Ionicons name="people-outline" size={18} color="#2196F3" />
          <Text style={styles.memberCount}>{memberCount} People</Text>
        </View>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{code}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  crown: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberCount: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  codeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  code: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
