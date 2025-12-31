import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '@/components/ui/PageHeader';
import ActionButtons from '@/components/ui/ActionButtons';
import SegmentedControl from '@/components/ui/SegmentedControl';
import TeamCard from '@/components/ui/TeamCard';
import { myTeams, otherTeams } from '@/data/mockData';

export default function TeamsScreen() {
  const [activeSegment, setActiveSegment] = useState(0);

  const handleCreateTeam = () => {
    // Navigate to create team
  };

  const handleJoinTeam = () => {
    // Navigate to join team
  };

  const teams = activeSegment === 0 ? myTeams : otherTeams;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Teams" subtitle="Manage yours team" />

        <ActionButtons onCreatePress={handleCreateTeam} onJoinPress={handleJoinTeam} />

        <SegmentedControl
          segments={['My team', 'Others Team']}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />

        {teams.map((team) => (
          <TeamCard
            key={team.id}
            name={team.name}
            description={team.description}
            memberCount={team.memberCount}
            code={team.code}
            isOwner={team.isOwner}
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
