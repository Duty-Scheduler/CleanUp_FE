import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '@/components/ui/PageHeader';
import ActivityItem from '@/components/ui/ActivityItem';
import SettingItem from '@/components/ui/SettingItem';
import { currentUser as mockUser, myTeams, recentActivities } from '@/data/mockData';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [notifications, setNotifications] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  // Use Redux user if authenticated, otherwise use mock user
  const displayUser = isAuthenticated && user ? {
    name: `${user.name} ${user.lastname || ''}`.trim(),
    email: user.email,
    avatar: user.avatar,
  } : mockUser;

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="My Tasks" subtitle="Manage your day here" />

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {displayUser.avatar ? (
                <Image source={{ uri: displayUser.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{displayUser.name.charAt(0)}</Text>
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayUser.name}</Text>
              <Text style={styles.userEmail}>{displayUser.email}</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={20} color="#2196F3" />
              <Text style={styles.statValue}>{myTeams.length} Teams</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={18} color="#2196F3" />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Team Avatars */}
        <View style={styles.teamAvatars}>
          {myTeams.slice(0, 4).map((team, index) => (
            <View key={team.id} style={[styles.teamAvatar, { marginLeft: index > 0 ? -10 : 0 }]}>
              <Text style={styles.teamAvatarText}>{team.name.charAt(0)}</Text>
            </View>
          ))}
          {myTeams.length > 4 && (
            <View style={[styles.teamAvatar, styles.moreAvatar, { marginLeft: -10 }]}>
              <Text style={styles.moreText}>+{myTeams.length - 4}</Text>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionSubtitle}>Your recent actions</Text>
          </View>
          {recentActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              type={activity.type}
              title={activity.title}
              subtitle={activity.subtitle}
              time={activity.time}
            />
          ))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.settingsIcon}>
              <Ionicons name="settings-outline" size={20} color="#666" />
            </View>
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>

          <SettingItem
            title="Notifications"
            subtitle="Receive app notifications"
            hasSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          <SettingItem
            title="Push Alerts"
            subtitle="Get push notifications on mobile"
            hasSwitch
            switchValue={pushAlerts}
            onSwitchChange={setPushAlerts}
          />
          <SettingItem
            title="Sound Effects"
            subtitle="Sound notifications for actions"
            hasSwitch
            switchValue={soundEffects}
            onSwitchChange={setSoundEffects}
          />
          <SettingItem
            title="Log out"
            isDestructive
            onPress={handleLogout}
          />
        </View>
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
  profileCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 14,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  teamAvatars: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  teamAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  teamAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  moreAvatar: {
    backgroundColor: '#F5F5F5',
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  settingsIcon: {
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#999',
    marginLeft: 'auto',
  },
});
