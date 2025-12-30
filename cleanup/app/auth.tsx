import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthHeader from '@/components/ui/AuthHeader';
import TabSwitch from '@/components/ui/TabSwitch';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  const handleSignup = () => {
    router.replace('/(tabs)');
  };

  const handleGoogleLogin = () => {
    // Implement Google login
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader />

        <TabSwitch
          tabs={['Log In', 'Sign Up']}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <View style={styles.formContainer}>
          {activeTab === 0 ? (
            // Login Form
            <>
              <Input
                label="Email"
                placeholder="Loisbecket@gmail.com"
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="*******"
                value={loginPassword}
                onChangeText={setLoginPassword}
                isPassword
              />

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color="#FFF" />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot Password ?</Text>
                </TouchableOpacity>
              </View>

              <Button title="Log In" onPress={handleLogin} style={styles.submitButton} />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or login with</Text>
                <View style={styles.divider} />
              </View>

              <Button
                title="Continue with Google"
                onPress={handleGoogleLogin}
                variant="google"
                icon={<GoogleIcon />}
              />
            </>
          ) : (
            // Signup Form
            <>
              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <Input
                    label="First Name"
                    placeholder="Lois"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={styles.nameInput}>
                  <Input
                    label="Last Name"
                    placeholder="Becket"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <Input
                label="Birth of date"
                placeholder="18/03/2024"
                value={birthDate}
                onChangeText={setBirthDate}
              />

              <Input
                label="Email"
                placeholder="Loisbecket@gmail.com"
                value={signupEmail}
                onChangeText={setSignupEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="*******"
                value={signupPassword}
                onChangeText={setSignupPassword}
                isPassword
              />

              <Input
                label="Confirm Password"
                placeholder="*******"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
              />

              <Button title="Sign Up" onPress={handleSignup} style={styles.submitButton} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleG}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  formContainer: {
    marginTop: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  rememberText: {
    fontSize: 14,
    color: '#666',
  },
  forgotText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  submitButton: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
});
