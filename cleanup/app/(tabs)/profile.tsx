import { userService, UserStats } from '@/api/services/users';
import PageHeader from '@/components/ui/PageHeader';
import SettingItem from '@/components/ui/SettingItem';
import { currentUser as mockUser } from '@/data/mockData';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { groups } = useAppSelector((state) => state.groups);
  
  const [notifications, setNotifications] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoadingStats(true);
        const response = await userService.getStats();
        setStats(response);
      } catch (error) {
        console.log('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  // Track profile view
  useEffect(() => {
    const trackProfileView = async () => {
      const app = getApp();
      const analytics = getAnalytics(app);
      
      // Always use current user ID - authenticated user takes priority
      const userId = await userService.getMe().id;

      await logEvent(analytics, 'screen_view' as any, {
        screen_name: 'Profile',
        screen_class: 'ProfileScreen',
        user_id: userId,
        is_authenticated: isAuthenticated,
      });
    };
    
    trackProfileView();
  }, []);

  // Use Redux user if authenticated, otherwise use mock user
  const displayUser = isAuthenticated && user ? {
    id: user.id,
    name: `${user.name} ${user.lastname || ''}`.trim(),
    email: user.email,
    avatar: user.avatar,
  } : mockUser;

  // Handle setting changes with analytics
  const handleNotificationChange = async (value: boolean) => {
    setNotifications(value);
    const app = getApp();
    const analytics = getAnalytics(app);
    
    // Always use current user ID - authenticated user takes priority
    const userId = (isAuthenticated && user?.id) || displayUser.id || 'guest';
    
    await logEvent(analytics, 'setting_changed', {
      setting_type: 'notifications',
      setting_value: value,
      user_id: userId,
      is_authenticated: isAuthenticated,
    });
    
    console.log('Analytics - Notification changed:', { 
      user_id: userId, 
      isAuthenticated, 
      authenticated_user_id: user?.id,
      display_user_id: displayUser.id 
    });
  };

  const handlePushAlertChange = async (value: boolean) => {
    setPushAlerts(value);
    const app = getApp();
    const analytics = getAnalytics(app);
    
    // Always use current user ID - authenticated user takes priority
    const userId = (isAuthenticated && user?.id) || displayUser.id || 'guest';
    
    await logEvent(analytics, 'setting_changed', {
      setting_type: 'push_alerts',
      setting_value: value,
      user_id: userId,
      is_authenticated: isAuthenticated,
    });
  };

  const handleSoundEffectChange = async (value: boolean) => {
    setSoundEffects(value);
    const app = getApp();
    const analytics = getAnalytics(app);
    
    // Always use current user ID - authenticated user takes priority
    const userId = (isAuthenticated && user?.id) || displayUser.id || 'guest';
    
    await logEvent(analytics, 'setting_changed', {
      setting_type: 'sound_effects',
      setting_value: value,
      user_id: userId,
      is_authenticated: isAuthenticated,
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            // Track logout event
            const app = getApp();
            const analytics = getAnalytics(app);
            
            // Always use current user ID - authenticated user takes priority
            const userId = (isAuthenticated && user?.id) || (mockUser?.id) || 'guest';
            
            await logEvent(analytics, 'user_logout', {
              user_id: userId,
              is_authenticated: isAuthenticated,
              timestamp: new Date().toISOString(),
            });
            dispatch(logout());
          },
        },
      ]
    );
  };

  // Calculate completion rate
  const completionRate = stats && stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader title="Profile" subtitle="Manage your account" />

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
              <Text style={styles.statValue}>{groups.length} Groups</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={18} color="#2196F3" />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <Text style={styles.sectionSubtitle}>Your activity overview</Text>
          </View>
          
          {loadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2196F3" />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {/* Total Tasks */}
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="list-outline" size={24} color="#2196F3" />
                </View>
                <Text style={styles.statNumber}>{stats?.totalTasks || 0}</Text>
                <Text style={styles.statLabel}>Total Tasks</Text>
              </View>

              {/* Completed Tasks */}
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.statNumber}>{stats?.completedTasks || 0}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>

              {/* Completion Rate */}
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="trending-up-outline" size={24} color="#FF9800" />
                </View>
                <Text style={styles.statNumber}>{completionRate}%</Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>

              {/* Penalty Count */}
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#FFEBEE' }]}>
                  <Ionicons name="warning-outline" size={24} color="#F44336" />
                </View>
                <Text style={styles.statNumber}>{stats?.penaltyCount || 0}</Text>
                <Text style={styles.statLabel}>Penalties</Text>
              </View>
            </View>
          )}
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
            onSwitchChange={handleNotificationChange}
          />
          <SettingItem
            title="Push Alerts"
            subtitle="Get push notifications on mobile"
            hasSwitch
            switchValue={pushAlerts}
            onSwitchChange={handlePushAlertChange}
          />
          <SettingItem
            title="Sound Effects"
            subtitle="Sound notifications for actions"
            hasSwitch
            switchValue={soundEffects}
            onSwitchChange={handleSoundEffectChange}
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
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
});
