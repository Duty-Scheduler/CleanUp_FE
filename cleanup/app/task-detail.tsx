import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { taskService, TaskDetail } from '@/api';
import { useToast } from '@/contexts/ToastContext';

export default function TaskDetailScreen() {
  const { groupId, taskId, groupName } = useLocalSearchParams<{
    groupId: string;
    taskId: string;
    groupName?: string;
  }>();

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchTaskDetail = useCallback(async () => {
    if (!groupId || !taskId) {
      setError('Missing group or task ID');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await taskService.getTaskDetail(groupId, taskId);
      setTask(response.task);
    } catch (err: any) {
      console.log('Failed to fetch task detail:', err);
      setError(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, taskId]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTaskDetail();
  };

  const handleBack = () => {
    router.back();
  };

  const handleCompleteTask = async () => {
    if (!taskId || !task) {
      console.log('Missing taskId or task');
      return;
    }
    if (task.status) {
      console.log('Task already completed');
      return;
    }

    const confirmComplete = () => {
      if (Platform.OS === 'web') {
        return window.confirm('Are you sure you want to mark this task as completed?');
      }
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Complete Task',
          'Are you sure you want to mark this task as completed?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Complete', onPress: () => resolve(true) },
          ]
        );
      });
    };

    const confirmed = await confirmComplete();
    if (!confirmed) return;

    try {
      setUpdating(true);
      console.log('Updating task:', taskId);
      console.log('Data:', { title: task.title, description: task.description || '', status: true });
      
      const result = await taskService.update(taskId, { 
        title: task.title,
        description: task.description || '',
        status: true 
      });
      console.log('Update result:', result);
      
      showToast('Task marked as completed!', 'success');
      router.back();
    } catch (err: any) {
      console.log('Failed to update task:', err);
      console.log('Error details:', JSON.stringify(err));
      const errorMessage = err.statusCode === 403 
        ? 'You do not have permission to update this task.'
        : err.message || 'Failed to update task.';
      showToast(errorMessage, 'error');
      setUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskId) {
      console.log('Missing taskId');
      return;
    }

    const confirmDelete = () => {
      if (Platform.OS === 'web') {
        return window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
      }
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Delete Task',
          'Are you sure you want to delete this task? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
          ]
        );
      });
    };

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      setDeleting(true);
      console.log('Deleting task:', taskId);
      
      const result = await taskService.delete(taskId);
      console.log('Delete result:', result);
      
      showToast('Task deleted successfully!', 'success');
      router.back();
    } catch (err: any) {
      console.log('Failed to delete task:', err);
      console.log('Error details:', JSON.stringify(err));
      const errorMessage = err.statusCode === 403 
        ? 'You do not have permission to delete this task.'
        : err.message || 'Failed to delete task.';
      showToast(errorMessage, 'error');
      setDeleting(false);
    }
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Completed' : 'In Progress';
  };

  const getStatusStyle = (status: boolean) => {
    return status ? styles.statusCompleted : styles.statusInProgress;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !task) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error || 'Task not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTaskDetail}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity 
          onPress={() => {
            console.log('Delete button pressed');
            handleDeleteTask();
          }} 
          style={styles.deleteButton}
          disabled={deleting}
          activeOpacity={0.7}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#F44336" />
          ) : (
            <Ionicons name="trash-outline" size={22} color="#F44336" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Task Title with Priority */}
        <View style={styles.titleSection}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>High</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          {/* Status Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="sync-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.statusRow}>
                <Text style={styles.infoValue}>{getStatusText(task.status)}</Text>
                <View style={[styles.statusBadge, getStatusStyle(task.status)]}>
                  <Text style={[styles.statusBadgeText, task.status ? styles.statusCompletedText : styles.statusInProgressText]}>
                    {task.status ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Team Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="people-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Assigned Team</Text>
              <View style={styles.teamRow}>
                <View style={styles.avatarStack}>
                  {task.Users?.slice(0, 3).map((user, index) => (
                    user.avatar ? (
                      <Image
                        key={user.id}
                        source={{ uri: user.avatar }}
                        style={[styles.stackAvatar, { marginLeft: index > 0 ? -10 : 0 }]}
                      />
                    ) : (
                      <View
                        key={user.id}
                        style={[styles.stackAvatarPlaceholder, { marginLeft: index > 0 ? -10 : 0 }]}
                      >
                        <Text style={styles.stackAvatarText}>{user.name?.charAt(0)}</Text>
                      </View>
                    )
                  ))}
                </View>
                <Text style={styles.teamName}>{groupName || 'Team'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Task Description</Text>
          <View style={styles.descriptionCard}>
            {task.description ? (
              <Text style={styles.descriptionText}>{task.description}</Text>
            ) : (
              <Text style={styles.noDescriptionText}>No description provided</Text>
            )}
          </View>
        </View>

        {/* Assigned Users Section */}
        {task.Users && task.Users.length > 0 && (
          <View style={styles.assigneesSection}>
            <Text style={styles.assigneesTitle}>Assigned Members</Text>
            {task.Users.map((user) => (
              <View key={user.id} style={styles.assigneeItem}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.assigneeAvatar} />
                ) : (
                  <View style={styles.assigneeAvatarPlaceholder}>
                    <Text style={styles.assigneeAvatarText}>{user.name?.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.assigneeInfo}>
                  <Text style={styles.assigneeName}>{user.name}</Text>
                  <Text style={styles.assigneeEmail}>{user.email}</Text>
                </View>
                {user.UserGroupTask?.penalty_status && (
                  <View style={styles.penaltyBadge}>
                    <Ionicons name="warning" size={14} color="#F44336" />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Proof Section */}
        {task.proof && task.proof.length > 0 && (
          <View style={styles.proofSection}>
            <Text style={styles.proofTitle}>Proof Submitted</Text>
            <View style={styles.proofBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.proofText}>{task.proof.length} proof(s) submitted</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.completeButton, task.status && styles.completeButtonDone]}
          disabled={task.status || updating}
          onPress={() => {
            console.log('Complete button pressed');
            handleCompleteTask();
          }}
          activeOpacity={0.7}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons
              name={task.status ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={20}
              color="#FFF"
            />
          )}
          <Text style={styles.completeButtonText}>
            {task.status ? 'Completed task' : updating ? 'Updating...' : 'Mark as Complete'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerRight: {
    width: 32,
  },
  deleteButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  taskTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    lineHeight: 28,
    marginRight: 12,
  },
  priorityBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F44336',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusInProgress: {
    backgroundColor: '#E3F2FD',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusInProgressText: {
    color: '#2196F3',
  },
  statusCompletedText: {
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: 10,
  },
  stackAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stackAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stackAvatarText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  descriptionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  noDescriptionText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  assigneesSection: {
    marginBottom: 20,
  },
  assigneesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  assigneeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  assigneeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  assigneeAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  assigneeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  assigneeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  assigneeEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  penaltyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proofSection: {
    marginBottom: 20,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  proofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  proofText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonDone: {
    backgroundColor: '#81C784',
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  editButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});
