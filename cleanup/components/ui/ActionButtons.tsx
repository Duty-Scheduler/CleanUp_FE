import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

interface ActionButtonsProps {
  onCreatePress: () => void;
  onJoinPress: () => void;
}

export default function ActionButtons({ onCreatePress, onJoinPress }: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      <Button
        title="Create team"
        onPress={onCreatePress}
        style={styles.createButton}
        icon={<Ionicons name="add" size={20} color="#FFF" />}
      />
      <Button
        title="Join now"
        onPress={onJoinPress}
        variant="outline"
        style={styles.joinButton}
        icon={<Ionicons name="people-outline" size={20} color="#333" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  createButton: {
    flex: 1,
    paddingVertical: 14,
  },
  joinButton: {
    flex: 1,
    paddingVertical: 14,
  },
});
