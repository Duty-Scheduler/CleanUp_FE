import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { joinTeam } from '@/store/slices/teamSlice';

export default function JoinTeamScreen() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.teams);
  
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleJoin = async () => {
    setCodeError('');
    
    const trimmedCode = code.trim().toUpperCase();
    
    if (!trimmedCode) {
      setCodeError('Team code is required');
      return;
    }

    if (trimmedCode.length < 4) {
      setCodeError('Please enter a valid team code');
      return;
    }

    try {
      const team = await dispatch(joinTeam({ code: trimmedCode })).unwrap();
      
      Alert.alert(
        'Success', 
        `You have joined "${team.name}" successfully!`, 
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      if (err.includes('not found') || err.includes('invalid')) {
        setCodeError('Invalid team code. Please check and try again.');
      } else if (err.includes('already')) {
        setCodeError('You are already a member of this team.');
      } else {
        Alert.alert('Error', err || 'Failed to join team');
      }
    }
  };

  const handleCodeChange = (text: string) => {
    // Auto uppercase and remove spaces
    setCode(text.toUpperCase().replace(/\s/g, ''));
    setCodeError('');
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
          <Text style={styles.headerTitle}>Join Team</Text>
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
            Enter the team code shared by your team admin to join an existing team.
          </Text>

          <Input
            label="Team Code"
            placeholder="Enter team code (e.g., ABC123)"
            value={code}
            onChangeText={handleCodeChange}
            error={codeError}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
          />

          <View style={styles.codePreview}>
            <Text style={styles.codePreviewLabel}>Code Preview:</Text>
            <Text style={styles.codePreviewValue}>
              {code || '------'}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="help-circle-outline" size={20} color="#FF9800" />
            <Text style={styles.infoText}>
              Don't have a code? Ask your team admin to share the team code with you.
            </Text>
          </View>

          <Button
            title="Join Team"
            onPress={handleJoin}
            loading={isLoading}
            disabled={isLoading || !code.trim()}
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
  codePreview: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  codePreviewLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  codePreviewValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 4,
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
