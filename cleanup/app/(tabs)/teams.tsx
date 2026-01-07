import ActionButtons from '@/components/ui/ActionButtons';
import PageHeader from '@/components/ui/PageHeader';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchJoinedGroups } from '@/store/slices/groupSlice';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeamsScreen() {
  const [activeSegment, setActiveSegment] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Reset state mỗi lần quay lại page
  useFocusEffect(
    useCallback(() => {
      setActiveSegment(0);
      setRefreshing(false);
    }, [])
  );

  const dispatch = useAppDispatch();
  const { groups, isLoading } = useAppSelector((state) => state.groups);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Separate groups into My Teams (admin) and Other Teams (not admin)
  const myTeams = groups.filter(g => g.UserGroupTask?.isAdmin === true);
  const otherTeams = groups.filter(g => g.UserGroupTask?.isAdmin === false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchJoinedGroups());
    }
  }, [isAuthenticated, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchJoinedGroups());
    setRefreshing(false);
  };

  const handleCreateTeam = () => {
    router.push('/create-team');
  };

  const handleJoinTeam = () => {
    router.push('/join-team');
  };

  const displayGroups = activeSegment === 0 ? myTeams : otherTeams;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={handleRefresh} />
        }
      >
        <PageHeader title="Groups" subtitle="Manage your groups" />

        <ActionButtons onCreatePress={handleCreateTeam} onJoinPress={handleJoinTeam} />

        <SegmentedControl
          segments={['My Teams', 'Other Teams']}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />

        {displayGroups.length > 0 ? (
          displayGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => router.push(`/group-detail?groupId=${group.id}`)}
              activeOpacity={0.7}
            >
              {/* Header Row */}
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Text style={styles.groupTitle}>{group.title}</Text>
                  {group.UserGroupTask?.isAdmin && (
                    <Ionicons name="trophy" size={18} color="#F5A623" style={styles.crownIcon} />
                  )}
                </View>
                <TouchableOpacity
                  style={styles.settingsBtn}
                  onPress={() => router.push(`/group-detail?groupId=${group.id}`)}
                >
                  <Ionicons name="settings-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Description */}
              <Text style={styles.groupDescription} numberOfLines={2}>
                {group.description || 'No description'}
              </Text>

              {/* Footer Row */}
              <View style={styles.cardFooter}>
                <View style={styles.memberCount}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.memberText}>
                    {(group as any).memberCount || 1} People
                  </Text>
                </View>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{group.id.slice(0, 8).toUpperCase()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#DDD" />
            <Text style={styles.emptyTitle}>
              {activeSegment === 0 ? 'No teams created' : 'Not a member of any team'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeSegment === 0
                ? 'Create a team to get started'
                : 'Join a team to collaborate'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={activeSegment === 0 ? handleCreateTeam : handleJoinTeam}
            >
              <Text style={styles.emptyButtonText}>
                {activeSegment === 0 ? 'Create Team' : 'Join Team'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  groupCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  crownIcon: {
    marginLeft: 8,
  },
  settingsBtn: {
    padding: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberText: {
    fontSize: 14,
    color: '#666',
  },
  codeBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  emptyButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
