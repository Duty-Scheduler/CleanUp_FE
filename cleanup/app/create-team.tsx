import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/contexts/ToastContext';
import { createGroup, clearInviteToken, fetchJoinedGroups } from '@/store/slices/groupSlice';

export default function CreateTeamScreen() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { isLoading, error, inviteToken } = useAppSelector((state) => state.groups);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  // Show invite modal when group is created
  useEffect(() => {
    if (inviteToken) {
      setShowInvite(true);
    }
  }, [inviteToken]);

  const handleCreate = async () => {
    setTitleError('');
    
    if (!title.trim()) {
      setTitleError('Group name is required');
      return;
    }

    if (!description.trim()) {
      setTitleError('Description is required');
      return;
    }

    try {
      await dispatch(createGroup({ 
        title: title.trim(), 
        description: description.trim()
      })).unwrap();
      showToast('Group created successfully!', 'success');
    } catch (err: any) {
      showToast(err || 'Failed to create group', 'error');
    }
  };

  const handleCopyInvite = async () => {
    if (inviteToken) {
      await Clipboard.setStringAsync(inviteToken);
      showToast('Invite token copied to clipboard', 'success');
    }
  };

  const handleShareInvite = async () => {
    if (inviteToken) {
      try {
        await Share.share({
          message: `Join my group on CleanUp! Use this invite code: ${inviteToken}`,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const handleDone = () => {
    dispatch(clearInviteToken());
    dispatch(fetchJoinedGroups());
    router.back();
  };

  if (showInvite && inviteToken) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.inviteContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          
          <Text style={styles.successTitle}>Group Created!</Text>
          <Text style={styles.successSubtitle}>
            Share this invite code with others to let them join your group.
          </Text>

          <View style={styles.inviteCodeBox}>
            <Text style={styles.inviteCodeLabel}>Invite Code</Text>
            <Text style={styles.inviteCode} numberOfLines={1} ellipsizeMode="middle">
              {inviteToken}
            </Text>
            <Text style={styles.inviteExpiry}>Expires in 7 days</Text>
          </View>

          <View style={styles.inviteActions}>
            <TouchableOpacity style={styles.inviteAction} onPress={handleCopyInvite}>
              <Ionicons name="copy-outline" size={24} color="#2196F3" />
              <Text style={styles.inviteActionText}>Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inviteAction} onPress={handleShareInvite}>
              <Ionicons name="share-outline" size={24} color="#2196F3" />
              <Text style={styles.inviteActionText}>Share</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Done"
            onPress={handleDone}
            style={styles.doneButton}
          />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Create Group</Text>
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
              <Ionicons name="people" size={48} color="#2196F3" />
            </View>
          </View>

          <Text style={styles.subtitle}>
            Create a new group and invite members to collaborate on tasks together.
          </Text>

          <Input
            label="Group Name"
            placeholder="Enter group name"
            value={title}
            onChangeText={setTitle}
            error={titleError}
            autoCapitalize="words"
          />

          <Input
            label="Description"
            placeholder="What is this group about?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.descriptionInput}
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              An invite code will be generated automatically. Share it with others to let them join.
            </Text>
          </View>

          <Button
            title="Create Group"
            onPress={handleCreate}
            loading={isLoading}
            disabled={isLoading}
            style={styles.createButton}
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
    backgroundColor: '#E3F2FD',
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
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  createButton: {
    marginTop: 8,
  },
  // Invite success styles
  inviteContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  inviteCodeBox: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  inviteCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  inviteExpiry: {
    fontSize: 12,
    color: '#FF9800',
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  inviteAction: {
    alignItems: 'center',
    gap: 4,
  },
  inviteActionText: {
    fontSize: 12,
    color: '#2196F3',
  },
  doneButton: {
    width: '100%',
  },
});
