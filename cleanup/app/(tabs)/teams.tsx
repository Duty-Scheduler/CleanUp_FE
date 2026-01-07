import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import PageHeader from '@/components/ui/PageHeader';
import ActionButtons from '@/components/ui/ActionButtons';
import SegmentedControl from '@/components/ui/SegmentedControl';
import TeamCard from '@/components/ui/TeamCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTeams } from '@/store/slices/teamSlice';
import { myTeams, otherTeams } from '@/data/mockData';

export default function TeamsScreen() {
  const [activeSegment, setActiveSegment] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatch = useAppDispatch();
  const { teams, isLoading } = useAppSelector((state) => state.teams);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTeams());
    }
  }, [isAuthenticated, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTeams());
    setRefreshing(false);
  };

  const handleCreateTeam = () => {
    router.push('/create-team');
  };

  const handleJoinTeam = () => {
    router.push('/join-team');
  };

  // Use API teams if authenticated, otherwise use mock data
  const displayTeams = isAuthenticated && teams.length > 0 
    ? teams 
    : (activeSegment === 0 ? myTeams : otherTeams);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <PageHeader title="Teams" subtitle="Manage yours team" />

        <ActionButtons onCreatePress={handleCreateTeam} onJoinPress={handleJoinTeam} />

        <SegmentedControl
          segments={['My team', 'Others Team']}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />

        {displayTeams.map((team) => (
          <TeamCard
            key={team.id}
            name={team.name}
            description={team.description}
            memberCount={team.memberCount}
            code={team.code}
            isOwner={'isOwner' in team ? team.isOwner : false}
            onSettingsPress={() => {}}
            onPress={() => {}}
          />
        ))}
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
});
