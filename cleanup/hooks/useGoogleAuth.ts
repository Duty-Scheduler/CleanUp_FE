import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { googleLogin, clearError } from '@/store/slices/authSlice';
import { GOOGLE_CONFIG } from '@/config/google';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// For native builds, import google-signin
let GoogleSignin: any = null;
let isSuccessResponse: any = null;

if (!isExpoGo && Platform.OS !== 'web') {
  try {
    const googleSigninModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = googleSigninModule.GoogleSignin;
    isSuccessResponse = googleSigninModule.isSuccessResponse;
  } catch (e) {
    console.log('Google Sign-In native module not available');
  }
}

// Required for expo-auth-session
WebBrowser.maybeCompleteAuthSession();

// Types for web Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export function useGoogleAuth() {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [localLoading, setLocalLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const initializedRef = useRef(false);

  // ============================================
  // EXPO GO: expo-auth-session
  // ============================================
  // For Expo Go, we need to use the Expo auth proxy
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const redirectUri = 'https://auth.expo.io/@thyenbvck/cleanup';
  
  console.log('Redirect URI:', redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CONFIG.webClientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  // Handle Expo Go auth response
  useEffect(() => {
    if (!isExpoGo || Platform.OS === 'web') return;

    const handleResponse = async () => {
      if (response?.type === 'success' && request?.codeVerifier) {
        const code = response.params?.code;
        if (code) {
          console.log('Expo Go: Got authorization code from Google');
          setLocalLoading(true);
          
          try {
            // Exchange code for tokens
            const tokenResponse = await fetch(discovery.tokenEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: GOOGLE_CONFIG.webClientId,
                code,
                code_verifier: request.codeVerifier,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
              }).toString(),
            });
            
            const tokens = await tokenResponse.json();
            console.log('Token response:', tokens);
            
            if (tokens.id_token) {
              console.log('Got id_token:', tokens.id_token);
              console.log('Sending to backend...');
              await dispatch(googleLogin(tokens.id_token)).unwrap();
            } else {
              console.error('No id_token in token response:', tokens);
            }
          } catch (err) {
            console.error('Token exchange failed:', err);
          } finally {
            setLocalLoading(false);
          }
        } else {
          console.error('No code in response:', response.params);
        }
      } else if (response?.type === 'error') {
        console.error('Auth error:', response.error);
      }
    };

    handleResponse();
  }, [response, request, dispatch, redirectUri]);

  // Set ready state for Expo Go
  useEffect(() => {
    if (isExpoGo && Platform.OS !== 'web') {
      setIsGoogleReady(!!request);
    }
  }, [request]);

  // ============================================
  // NATIVE BUILD: @react-native-google-signin
  // ============================================
  useEffect(() => {
    if (Platform.OS === 'web' || isExpoGo || !GoogleSignin) return;

    GoogleSignin.configure({
      webClientId: GOOGLE_CONFIG.webClientId,
      iosClientId: GOOGLE_CONFIG.iosClientId,
      offlineAccess: false,
      forceCodeForRefreshToken: false,
      profileImageSize: 120,
    });
    setIsGoogleReady(true);
  }, []);

  const signInWithGoogleNative = useCallback(async () => {
    if (!GoogleSignin) return;
    
    try {
      setLocalLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      if (isSuccessResponse && isSuccessResponse(response)) {
        const idToken = response.data.idToken;
        if (idToken) {
          console.log('Native: Got idToken from Google');
          await dispatch(googleLogin(idToken)).unwrap();
        } else {
          console.error('No idToken received');
        }
      } else {
        console.log('Sign in was cancelled');
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch]);

  // ============================================
  // WEB: Google Identity Services
  // ============================================
  const handleWebCredentialResponse = useCallback((response: any) => {
    const idToken = response.credential;
    if (idToken) {
      console.log('Web: Got idToken from Google');
      setLocalLoading(true);
      dispatch(googleLogin(idToken))
        .unwrap()
        .catch((err) => console.error('Login failed:', err))
        .finally(() => setLocalLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (Platform.OS !== 'web' || initializedRef.current) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CONFIG.webClientId,
          callback: handleWebCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        console.log('Web: Google Identity Services initialized');
        setIsGoogleReady(true);
        initializedRef.current = true;
        return true;
      } catch (err) {
        console.error('Failed to initialize Google:', err);
        return false;
      }
    };

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const checkInterval = setInterval(() => {
          if (initializeGoogle()) clearInterval(checkInterval);
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 5000);
      };
      document.head.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if (initializeGoogle()) clearInterval(checkInterval);
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5000);
    }
  }, [handleWebCredentialResponse]);

  // ============================================
  // SHARED FUNCTIONS
  // ============================================
  const signInWithGoogle = useCallback(async () => {
    dispatch(clearError());
    
    if (Platform.OS === 'web') {
      // Web: use Google Identity Services
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      }
    } else if (isExpoGo) {
      // Expo Go: use expo-auth-session
      console.log('Using Expo Go auth...');
      await promptAsync();
    } else {
      // Native build: use @react-native-google-signin
      await signInWithGoogleNative();
    }
  }, [dispatch, promptAsync, signInWithGoogleNative]);

  const renderGoogleButton = useCallback((containerId: string) => {
    if (Platform.OS !== 'web') return;
    
    const tryRender = () => {
      const container = document.getElementById(containerId);
      if (!container || !window.google?.accounts?.id) return false;

      container.innerHTML = '';
      try {
        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 300,
        });
        return true;
      } catch (err) {
        return false;
      }
    };

    if (!tryRender()) {
      const retryInterval = setInterval(() => {
        if (tryRender()) clearInterval(retryInterval);
      }, 200);
      setTimeout(() => clearInterval(retryInterval), 5000);
    }
  }, []);

  return {
    signInWithGoogle,
    renderGoogleButton,
    isLoading: isLoading || localLoading,
    error,
    isAuthenticated,
    isReady: isGoogleReady,
  };
}
