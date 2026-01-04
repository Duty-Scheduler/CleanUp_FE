import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthHeader from '@/components/ui/AuthHeader';
import TabSwitch from '@/components/ui/TabSwitch';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAppSelector } from '@/store/hooks';
import { isGoogleConfigured } from '@/config/google';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');

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

  // Google Auth
  const { signInWithGoogle, renderGoogleButton, isLoading: googleLoading, error: googleError, isAuthenticated, isReady } = useGoogleAuth();
  const authState = useAppSelector((state) => state.auth);

  // Navigate to home when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  // Render Google button when ready
  useEffect(() => {
    if (Platform.OS === 'web' && isReady) {
      renderGoogleButton('google-signin-button');
      renderGoogleButton('google-signup-button');
    }
  }, [isReady, activeTab, renderGoogleButton]);

  // Show error if Google login fails
  useEffect(() => {
    if (googleError) {
      Alert.alert('Login Failed', googleError);
    }
  }, [googleError]);

  const handleLogin = () => {
    setLoginError('');
    
    if (loginEmail === 'test' && loginPassword === 'test') {
      router.replace('/(tabs)');
    } else {
      setLoginError('Invalid username or password');
      Alert.alert('Login Failed', 'Please use username: test and password: test');
    }
  };

  const handleSignup = () => {
    router.replace('/(tabs)');
  };

  const handleGoogleLogin = async () => {
    if (!isGoogleConfigured()) {
      Alert.alert(
        'Chưa cấu hình Google',
        'Vui lòng cập nhật Google Client ID trong file config/google.ts',
        [{ text: 'OK' }]
      );
      return;
    }
    await signInWithGoogle();
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
                label="Username"
                placeholder="test"
                value={loginEmail}
                onChangeText={setLoginEmail}
                autoCapitalize="none"
                error={loginError ? ' ' : undefined}
              />

              <Input
                label="Password"
                placeholder="test"
                value={loginPassword}
                onChangeText={setLoginPassword}
                isPassword
                error={loginError}
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

              {/* Google Sign-In Button Container for Web */}
              {Platform.OS === 'web' ? (
                <View style={styles.googleButtonContainer}>
                  <div id="google-signin-button" style={{ display: 'flex', justifyContent: 'center' }} />
                </View>
              ) : (
                <Button
                  title="Continue with Google"
                  onPress={handleGoogleLogin}
                  variant="google"
                  icon={<GoogleIcon />}
                  loading={googleLoading}
                  disabled={googleLoading}
                />
              )}
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

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or sign up with</Text>
                <View style={styles.divider} />
              </View>

              {/* Google Sign-Up Button Container for Web */}
              {Platform.OS === 'web' ? (
                <View style={styles.googleButtonContainer}>
                  <div id="google-signup-button" style={{ display: 'flex', justifyContent: 'center' }} />
                </View>
              ) : (
                <Button
                  title="Continue with Google"
                  onPress={handleGoogleLogin}
                  variant="google"
                  icon={<GoogleIcon />}
                  loading={googleLoading}
                  disabled={googleLoading}
                />
              )}
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
  googleButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
