import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/contexts/ToastContext';
import { joinGroup, fetchJoinedGroups } from '@/store/slices/groupSlice';

export default function JoinTeamScreen() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { isLoading } = useAppSelector((state) => state.groups);
  
  const [groupId, setGroupId] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setError('');
    
    if (!groupId.trim()) {
      setError('Group ID is required');
      return;
    }

    if (!inviteToken.trim()) {
      setError('Invite token is required');
      return;
    }

    try {
      await dispatch(joinGroup({ 
        groupId: groupId.trim(), 
        inviteToken: inviteToken.trim() 
      })).unwrap();
      
      dispatch(fetchJoinedGroups());
      showToast('You have joined the group successfully!', 'success');
      router.back();
    } catch (err: any) {
      console.log('Join error:', err);
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to join group';
      
      if (errorMsg.includes('not found')) {
        setError('Group not found. Please check the Group ID.');
      } else if (errorMsg.includes('invalid') || errorMsg.includes('Forbidden')) {
        setError('Invalid invite token. Please check and try again.');
      } else if (errorMsg.includes('already')) {
        setError('You are already a member of this group.');
      } else if (errorMsg.includes('Authorization') || errorMsg.includes('401')) {
        showToast('Session expired. Please login again.', 'error');
      } else {
        showToast(errorMsg, 'error');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join Group</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <View style={styles.teamIcon}>
              <Ionicons name="enter-outline" size={48} color="#4CAF50" />
            </View>
          </View>

          <Text style={styles.subtitle}>
            Enter the group ID and invite token shared by your group admin to join.
          </Text>

          <Input
            label="Group ID"
            placeholder="Enter group ID (UUID)"
            value={groupId}
            onChangeText={(text) => { setGroupId(text); setError(''); }}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Invite Token"
            placeholder="Enter invite token"
            value={inviteToken}
            onChangeText={(text) => { setInviteToken(text); setError(''); }}
            error={error}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.infoBox}>
            <Ionicons name="help-circle-outline" size={20} color="#FF9800" />
            <Text style={styles.infoText}>
              Don't have an invite? Ask your group admin to share the group ID and invite token with you.
            </Text>
          </View>

          <Button
            title="Join Group"
            onPress={handleJoin}
            loading={isLoading}
            disabled={isLoading || !groupId.trim() || !inviteToken.trim()}
            style={styles.joinButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  teamIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  joinButton: {
    marginTop: 8,
  },
});
