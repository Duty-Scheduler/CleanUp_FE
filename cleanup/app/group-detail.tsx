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
import { userService, groupService, GroupMember } from '@/api';
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
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  
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

  useEffect(() => {
    fetchMembers();
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

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
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
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
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
      ]
    );
  };

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

        {/* Members Summary */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.membersSummary}
            onPress={() => setShowMembersModal(true)}
          >
            <View style={styles.membersSummaryLeft}>
              <Ionicons name="people-outline" size={24} color="#2196F3" />
              <View>
                <Text style={styles.membersSummaryTitle}>Members</Text>
                <Text style={styles.membersSummaryCount}>
                  {loadingMembers ? 'Loading...' : `${members.length} members`}
                </Text>
              </View>
            </View>
            <View style={styles.viewDetailsBtn}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Ionicons name="chevron-forward" size={18} color="#2196F3" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Invite Section (Admin only) */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invite Members</Text>
            {inviteToken ? (
              <View style={styles.inviteBox}>
                <Text style={styles.inviteLabel}>Invite Token</Text>
                <Text style={styles.inviteToken} numberOfLines={1} ellipsizeMode="middle">
                  {inviteToken}
                </Text>
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
              <Button
                title="Generate Invite Link"
                onPress={handleGenerateInvite}
                loading={isLoading}
                variant="outline"
                icon={<Ionicons name="link-outline" size={20} color="#2196F3" />}
              />
            )}
          </View>
        )}

        {/* Group ID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group ID</Text>
          <TouchableOpacity 
            style={styles.idBox}
            onPress={async () => {
              await Clipboard.setStringAsync(group.id);
              showToast('Group ID copied to clipboard', 'success');
            }}
          >
            <Text style={styles.idText} numberOfLines={1} ellipsizeMode="middle">{group.id}</Text>
            <Ionicons name="copy-outline" size={18} color="#999" />
          </TouchableOpacity>
        </View>

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
      <Modal
        visible={showMembersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMembersModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Members ({members.length})</Text>
            <TouchableOpacity onPress={() => setShowMembersModal(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.avatarCol]}>Avatar</Text>
              <Text style={[styles.tableHeaderText, styles.nameCol]}>Name</Text>
              <Text style={[styles.tableHeaderText, styles.emailCol]}>Email</Text>
              {isAdmin && <Text style={[styles.tableHeaderText, styles.actionCol]}>Action</Text>}
            </View>

            {loadingMembers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
              </View>
            ) : members.length > 0 ? (
              members.map((member, index) => (
                <View 
                  key={member.id} 
                  style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
                >
                  {/* Avatar */}
                  <View style={styles.avatarCol}>
                    {member.avatar ? (
                      <Image source={{ uri: member.avatar }} style={styles.tableAvatar} />
                    ) : (
                      <View style={styles.tableAvatarPlaceholder}>
                        <Text style={styles.tableAvatarText}>
                          {member.name?.charAt(0) || '?'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Name */}
                  <View style={styles.nameCol}>
                    <Text style={styles.tableName}>{member.name} {member.lastname}</Text>
                    {member.UserGroupTask?.isAdmin && (
                      <View style={styles.adminTag}>
                        <Text style={styles.adminTagText}>Admin</Text>
                      </View>
                    )}
                  </View>

                  {/* Email */}
                  <Text style={[styles.tableEmail, styles.emailCol]} numberOfLines={1}>
                    {member.email}
                  </Text>

                  {/* Delete Button (Admin only) */}
                  {isAdmin && (
                    <View style={styles.actionCol}>
                      {member.id !== currentUser?.id && !member.UserGroupTask?.isAdmin ? (
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleRemoveMember(member)}
                          disabled={removingMemberId === member.id}
                        >
                          {removingMemberId === member.id ? (
                            <ActivityIndicator size="small" color="#F44336" />
                          ) : (
                            <Ionicons name="trash-outline" size={18} color="#F44336" />
                          )}
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.deleteBtnDisabled}>
                          <Ionicons name="remove-outline" size={18} color="#CCC" />
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noMembers}>No members found</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  placeholder: { width: 32 },
  scrollView: { flex: 1 },
  content: { padding: 24 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  groupHeader: { alignItems: 'center', marginBottom: 24 },
  groupIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  groupTitle: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 8 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  descriptionBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  descriptionLabel: { fontSize: 12, color: '#999', marginBottom: 8 },
  descriptionText: { fontSize: 14, color: '#333', lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  membersSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  membersSummaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  membersSummaryTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  membersSummaryCount: { fontSize: 13, color: '#666', marginTop: 2 },
  viewDetailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewDetailsText: { fontSize: 14, color: '#2196F3', fontWeight: '500' },
  inviteBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  inviteLabel: { fontSize: 12, color: '#999', marginBottom: 8 },
  inviteToken: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  inviteExpiry: { fontSize: 11, color: '#FF9800', marginBottom: 16 },
  inviteActions: { flexDirection: 'row', gap: 24 },
  inviteAction: { alignItems: 'center', gap: 4 },
  inviteActionText: { fontSize: 11, color: '#2196F3' },
  idBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  idText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionsSection: { marginTop: 16, gap: 12 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    gap: 12,
  },
  actionText: { fontSize: 16, fontWeight: '500' },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  closeButton: { padding: 4 },
  modalContent: { flex: 1 },
  loadingContainer: { padding: 40, alignItems: 'center' },
  // Table styles
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeaderText: { fontSize: 12, fontWeight: '600', color: '#666', textTransform: 'uppercase' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableRowEven: { backgroundColor: '#FAFAFA' },
  avatarCol: { width: 60, alignItems: 'center' },
  nameCol: { flex: 1.2, paddingRight: 8 },
  emailCol: { flex: 1.5, paddingRight: 8 },
  actionCol: { width: 50, alignItems: 'center' },
  tableAvatar: { width: 40, height: 40, borderRadius: 20 },
  tableAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableAvatarText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  tableName: { fontSize: 14, fontWeight: '500', color: '#333' },
  adminTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  adminTagText: { fontSize: 10, color: '#4CAF50', fontWeight: '600' },
  tableEmail: { fontSize: 13, color: '#666' },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnDisabled: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMembers: { fontSize: 14, color: '#999', textAlign: 'center', padding: 40 },
});
