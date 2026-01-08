import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/contexts/ToastContext';
import { userService, groupService, taskService, GroupMember, GroupTask } from '@/api';
import { 
  leaveGroup, 
  deleteGroup, 
  createInviteToken,
  clearInviteToken,
  setCurrentGroup,
  fetchJoinedGroups,
} from '@/store/slices/groupSlice';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { groups, currentGroup, inviteToken, isLoading } = useAppSelector((state) => state.groups);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [tasks, setTasks] = useState<GroupTask[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  
  const group = groups.find(g => g.id === groupId) || currentGroup;
  const isAdmin = group?.UserGroupTask?.isAdmin || false;

  useEffect(() => {
    if (group) {
      dispatch(setCurrentGroup(group));
    }
  }, [group, dispatch]);

  // Fetch group members
  const fetchMembers = async () => {
    if (!groupId) return;
    try {
      setLoadingMembers(true);
      const response = await userService.getByGroup(groupId);
      setMembers(response.users);
    } catch (error) {
      console.log('Failed to fetch members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Fetch group tasks
  const fetchTasks = async () => {
    if (!groupId) return;
    try {
      setLoadingTasks(true);
      const response = await taskService.getByGroup(groupId);
      setTasks(response.tasks || []);
    } catch (error) {
      console.log('Failed to fetch tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTasks();
  }, [groupId]);

  const handleGenerateInvite = async () => {
    if (!groupId) return;
    try {
      await dispatch(createInviteToken(groupId)).unwrap();
    } catch (err: any) {
      showToast(err || 'Failed to generate invite', 'error');
    }
  };

  const handleCopyInvite = async () => {
    if (inviteToken) {
      await Clipboard.setStringAsync(inviteToken);
      showToast('Invite token copied to clipboard', 'success');
    }
  };

  const handleShareInvite = async () => {
    if (inviteToken && groupId) {
      try {
        await Share.share({
          message: `Join my group on CleanUp!\n\nGroup ID: ${groupId}\nInvite Code: ${inviteToken}`,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    if (member.UserGroupTask?.isAdmin) {
      showToast('Cannot remove admin from group', 'warning');
      return;
    }
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} ${member.lastname} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemovingMemberId(member.id);
              await groupService.removeMember(groupId!, member.id);
              showToast('Member removed successfully', 'success');
              fetchMembers();
            } catch (err: any) {
              showToast(err?.message || 'Failed to remove member', 'error');
            } finally {
              setRemovingMemberId(null);
            }
          },
        },
      ]
    );
  };

  const handleDeleteTask = (task: GroupTask) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingTaskId(task.id);
              await taskService.delete(task.id);
              showToast('Task deleted successfully', 'success');
              fetchTasks();
            } catch (err: any) {
              showToast(err?.message || 'Failed to delete task', 'error');
            } finally {
              setDeletingTaskId(null);
            }
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(leaveGroup(groupId!)).unwrap();
            showToast('You have left the group', 'success');
            dispatch(fetchJoinedGroups());
            router.back();
          } catch (err: any) {
            showToast(err || 'Failed to leave group', 'error');
          }
        },
      },
    ]);
  };

  const handleDeleteGroup = () => {
    Alert.alert('Delete Group', 'Are you sure you want to delete this group? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteGroup(groupId!)).unwrap();
            showToast('Group deleted successfully', 'success');
            dispatch(fetchJoinedGroups());
            router.back();
          } catch (err: any) {
            showToast(err || 'Failed to delete group', 'error');
          }
        },
      },
    ]);
  };

  // Calculate task stats
  const completedTasks = tasks.filter(t => t.status === true).length;
  const totalTasks = tasks.length;

  if (!group) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Group Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Group Info */}
        <View style={styles.groupHeader}>
          <View style={styles.groupIcon}>
            <Ionicons name="people" size={40} color="#2196F3" />
          </View>
          <Text style={styles.groupTitle}>{group.title}</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{group.description || 'No description'}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCard} onPress={() => setShowMembersModal(true)}>
            <Ionicons name="people-outline" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => setShowTasksModal(true)}>
            <Ionicons name="list-outline" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        {/* Tasks Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <TouchableOpacity onPress={() => setShowTasksModal(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {loadingTasks ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : tasks.length > 0 ? (
            tasks.slice(0, 3).map((task) => (
              <View key={task.id} style={styles.taskPreviewCard}>
                <View style={styles.taskCheckbox}>
                  {task.status ? (
                    <Ionicons name="checkbox" size={22} color="#4CAF50" />
                  ) : (
                    <Ionicons name="square-outline" size={22} color="#CCC" />
                  )}
                </View>
                <View style={styles.taskPreviewInfo}>
                  <Text style={[styles.taskPreviewTitle, task.status && styles.taskCompleted]}>
                    {task.title}
                  </Text>
                  {task.Users && task.Users.length > 0 && (
                    <View style={styles.assigneesRow}>
                      {task.Users.slice(0, 3).map((user, idx) => (
                        <View key={user.id} style={[styles.assigneeAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}>
                          {user.avatar ? (
                            <Image source={{ uri: user.avatar }} style={styles.assigneeImg} />
                          ) : (
                            <Text style={styles.assigneeInitial}>{user.name?.charAt(0)}</Text>
                          )}
                        </View>
                      ))}
                      {task.Users.length > 3 && (
                        <Text style={styles.moreAssignees}>+{task.Users.length - 3}</Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noTasksText}>No tasks yet</Text>
          )}
        </View>

        {/* Invite Section (Admin only) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invite Members</Text>
            {inviteToken ? (
              <View style={styles.inviteBox}>
                <Text style={styles.inviteLabel}>Invite Token</Text>
                <Text style={styles.inviteToken} numberOfLines={1} ellipsizeMode="middle">{inviteToken}</Text>
                <Text style={styles.inviteExpiry}>Expires in 7 days</Text>
                <View style={styles.inviteActions}>
                  <TouchableOpacity style={styles.inviteAction} onPress={handleCopyInvite}>
                    <Ionicons name="copy-outline" size={20} color="#2196F3" />
                    <Text style={styles.inviteActionText}>Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.inviteAction} onPress={handleShareInvite}>
                    <Ionicons name="share-outline" size={20} color="#2196F3" />
                    <Text style={styles.inviteActionText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.inviteAction} onPress={() => dispatch(clearInviteToken())}>
                    <Ionicons name="close-outline" size={20} color="#999" />
                    <Text style={[styles.inviteActionText, { color: '#999' }]}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Button title="Generate Invite Link" onPress={handleGenerateInvite} loading={isLoading} variant="outline" icon={<Ionicons name="link-outline" size={20} color="#2196F3" />} />
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLeaveGroup}>
            <Ionicons name="exit-outline" size={22} color="#FF9800" />
            <Text style={[styles.actionText, { color: '#FF9800' }]}>Leave Group</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteGroup}>
              <Ionicons name="trash-outline" size={22} color="#F44336" />
              <Text style={[styles.actionText, { color: '#F44336' }]}>Delete Group</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Members Modal */}
      <Modal visible={showMembersModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowMembersModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Members ({members.length})</Text>
            <TouchableOpacity onPress={() => setShowMembersModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {loadingMembers ? (
              <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#2196F3" /></View>
            ) : members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                {member.avatar ? (
                  <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                ) : (
                  <View style={styles.memberAvatarPlaceholder}>
                    <Text style={styles.memberAvatarText}>{member.name?.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>{member.name} {member.lastname}</Text>
                    {member.UserGroupTask?.isAdmin && <View style={styles.adminTag}><Text style={styles.adminTagText}>Admin</Text></View>}
                  </View>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
                {isAdmin && member.id !== currentUser?.id && !member.UserGroupTask?.isAdmin && (
                  <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveMember(member)} disabled={removingMemberId === member.id}>
                    {removingMemberId === member.id ? <ActivityIndicator size="small" color="#F44336" /> : <Ionicons name="trash-outline" size={18} color="#F44336" />}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Tasks Modal */}
      <Modal visible={showTasksModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowTasksModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tasks ({tasks.length})</Text>
            <TouchableOpacity onPress={() => setShowTasksModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {loadingTasks ? (
              <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#2196F3" /></View>
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskCardHeader}>
                    <View style={styles.taskCheckbox}>
                      {task.status ? <Ionicons name="checkbox" size={24} color="#4CAF50" /> : <Ionicons name="square-outline" size={24} color="#CCC" />}
                    </View>
                    <View style={styles.taskCardInfo}>
                      <Text style={[styles.taskCardTitle, task.status && styles.taskCompleted]}>{task.title}</Text>
                      {task.description && <Text style={styles.taskCardDesc} numberOfLines={2}>{task.description}</Text>}
                    </View>
                    <View style={[styles.statusBadge, task.status ? styles.statusDone : styles.statusPending]}>
                      <Text style={[styles.statusText, task.status ? styles.statusDoneText : styles.statusPendingText]}>
                        {task.status ? 'Done' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  {task.Users && task.Users.length > 0 && (
                    <View style={styles.taskAssignees}>
                      <Text style={styles.assigneesLabel}>Assigned to:</Text>
                      <View style={styles.assigneesList}>
                        {task.Users.map((user) => (
                          <View key={user.id} style={styles.assigneeChip}>
                            {user.avatar ? (
                              <Image source={{ uri: user.avatar }} style={styles.assigneeChipAvatar} />
                            ) : (
                              <View style={styles.assigneeChipPlaceholder}>
                                <Text style={styles.assigneeChipInitial}>{user.name?.charAt(0)}</Text>
                              </View>
                            )}
                            <Text style={styles.assigneeChipName}>{user.name}</Text>
                            {user.UserGroupTask?.penalty_status && <Ionicons name="warning" size={12} color="#F44336" />}
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {isAdmin && (
                    <View style={styles.taskCardActions}>
                      <TouchableOpacity style={styles.taskActionBtn}>
                        <Ionicons name="create-outline" size={18} color="#2196F3" />
                        <Text style={styles.taskActionBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.taskActionBtn} onPress={() => handleDeleteTask(task)} disabled={deletingTaskId === task.id}>
                        {deletingTaskId === task.id ? <ActivityIndicator size="small" color="#F44336" /> : <Ionicons name="trash-outline" size={18} color="#F44336" />}
                        <Text style={[styles.taskActionBtnText, { color: '#F44336' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyTasks}>
                <Ionicons name="list-outline" size={48} color="#DDD" />
                <Text style={styles.emptyTasksText}>No tasks in this group</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  placeholder: { width: 32 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  groupHeader: { alignItems: 'center', marginBottom: 20 },
  groupIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  groupTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 8 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, gap: 4 },
  adminText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  descriptionBox: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, marginBottom: 20 },
  descriptionLabel: { fontSize: 11, color: '#999', marginBottom: 6 },
  descriptionText: { fontSize: 14, color: '#333', lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#333', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  viewAllText: { fontSize: 14, color: '#2196F3', fontWeight: '500' },
  taskPreviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 10, padding: 12, marginBottom: 8 },
  taskCheckbox: { marginRight: 12 },
  taskPreviewInfo: { flex: 1 },
  taskPreviewTitle: { fontSize: 14, fontWeight: '500', color: '#333' },
  taskCompleted: { textDecorationLine: 'line-through', color: '#999' },
  assigneesRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  assigneeAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2196F3', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  assigneeImg: { width: 24, height: 24, borderRadius: 12 },
  assigneeInitial: { fontSize: 10, fontWeight: '600', color: '#FFF' },
  moreAssignees: { fontSize: 11, color: '#666', marginLeft: 4 },
  noTasksText: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
  inviteBox: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, alignItems: 'center' },
  inviteLabel: { fontSize: 12, color: '#999', marginBottom: 8 },
  inviteToken: { fontSize: 14, fontWeight: '600', color: '#333', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: 4 },
  inviteExpiry: { fontSize: 11, color: '#FF9800', marginBottom: 16 },
  inviteActions: { flexDirection: 'row', gap: 24 },
  inviteAction: { alignItems: 'center', gap: 4 },
  inviteActionText: { fontSize: 11, color: '#2196F3' },
  actionsSection: { marginTop: 8, gap: 10 },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#F5F5F5', borderRadius: 10, gap: 10 },
  actionText: { fontSize: 15, fontWeight: '500' },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  closeButton: { padding: 4 },
  modalContent: { flex: 1, padding: 16 },
  loadingContainer: { padding: 40, alignItems: 'center' },
  // Member row styles
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  memberAvatar: { width: 44, height: 44, borderRadius: 22 },
  memberAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2196F3', alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  memberName: { fontSize: 15, fontWeight: '600', color: '#333' },
  memberEmail: { fontSize: 13, color: '#666', marginTop: 2 },
  adminTag: { backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  adminTagText: { fontSize: 10, color: '#4CAF50', fontWeight: '600' },
  removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  // Task card styles
  taskCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, marginBottom: 12 },
  taskCardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  taskCardInfo: { flex: 1, marginLeft: 12 },
  taskCardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  taskCardDesc: { fontSize: 13, color: '#666', marginTop: 4, lineHeight: 18 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusDone: { backgroundColor: '#E8F5E9' },
  statusPending: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 11, fontWeight: '600' },
  statusDoneText: { color: '#4CAF50' },
  statusPendingText: { color: '#FF9800' },
  taskAssignees: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E8E8E8' },
  assigneesLabel: { fontSize: 12, color: '#999', marginBottom: 8 },
  assigneesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  assigneeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: '#E8E8E8' },
  assigneeChipAvatar: { width: 20, height: 20, borderRadius: 10 },
  assigneeChipPlaceholder: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#2196F3', alignItems: 'center', justifyContent: 'center' },
  assigneeChipInitial: { fontSize: 10, fontWeight: '600', color: '#FFF' },
  assigneeChipName: { fontSize: 12, color: '#333' },
  taskCardActions: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E8E8E8', gap: 16 },
  taskActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taskActionBtnText: { fontSize: 13, color: '#2196F3', fontWeight: '500' },
  emptyTasks: { alignItems: 'center', paddingVertical: 60 },
  emptyTasksText: { fontSize: 14, color: '#999', marginTop: 12 },
});
