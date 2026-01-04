import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { googleLogin, clearError } from '@/store/slices/authSlice';
import { GOOGLE_CONFIG } from '@/config/google';

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
    handleGoogleCredentialResponse?: (response: any) => void;
  }
}

export function useGoogleAuth() {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const [localLoading, setLocalLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const initializedRef = useRef(false);

  // Handle credential response from Google
  const handleCredentialResponse = useCallback((response: any) => {
    console.log('Google credential response received');
    const idToken = response.credential;
    
    if (idToken) {
      console.log('Got idToken from Google, length:', idToken.length);
      setLocalLoading(true);
      dispatch(googleLogin(idToken))
        .unwrap()
        .then(() => {
          console.log('Login successful!');
        })
        .catch((err) => {
          console.error('Login failed:', err);
        })
        .finally(() => {
          setLocalLoading(false);
        });
    } else {
      console.error('No credential in response');
    }
  }, [dispatch]);

  useEffect(() => {
    if (Platform.OS !== 'web' || initializedRef.current) return;

    // Set global callback
    window.handleGoogleCredentialResponse = handleCredentialResponse;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        console.log('Waiting for Google script...');
        return false;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CONFIG.webClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        console.log('Google Identity Services initialized with client:', GOOGLE_CONFIG.webClientId);
        setIsGoogleReady(true);
        initializedRef.current = true;
        return true;
      } catch (err) {
        console.error('Failed to initialize Google:', err);
        return false;
      }
    };

    // Load Google script if not already loaded
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google script loaded');
        // Wait a bit for google object to be available
        const checkInterval = setInterval(() => {
          if (initializeGoogle()) {
            clearInterval(checkInterval);
          }
        }, 100);
        setTimeout(() => clearInterval(checkInterval), 5000);
      };
      document.head.appendChild(script);
    } else {
      // Script already loaded, try to initialize
      const checkInterval = setInterval(() => {
        if (initializeGoogle()) {
          clearInterval(checkInterval);
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5000);
    }

    return () => {
      window.handleGoogleCredentialResponse = undefined;
    };
  }, [handleCredentialResponse]);

  // Render Google Sign-In button
  const renderGoogleButton = useCallback((containerId: string) => {
    if (Platform.OS !== 'web') return;
    
    const tryRender = () => {
      const container = document.getElementById(containerId);
      if (!container || !window.google?.accounts?.id) {
        return false;
      }

      // Clear existing content
      container.innerHTML = '';

      try {
        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 300,
        });
        console.log('Google button rendered in:', containerId);
        return true;
      } catch (err) {
        console.error('Failed to render Google button:', err);
        return false;
      }
    };

    // Try immediately, then retry if needed
    if (!tryRender()) {
      const retryInterval = setInterval(() => {
        if (tryRender()) {
          clearInterval(retryInterval);
        }
      }, 200);
      setTimeout(() => clearInterval(retryInterval), 5000);
    }
  }, []);

  // Trigger One Tap prompt
  const signInWithGoogle = useCallback(() => {
    if (Platform.OS !== 'web') {
      console.log('Google Sign-In only available on web');
      return;
    }

    if (!window.google?.accounts?.id) {
      console.error('Google not ready');
      return;
    }

    dispatch(clearError());
    console.log('Triggering Google One Tap...');
    
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.log('One Tap not displayed:', notification.getNotDisplayedReason());
      }
      if (notification.isSkippedMoment()) {
        console.log('One Tap skipped:', notification.getSkippedReason());
      }
    });
  }, [dispatch]);

  return {
    signInWithGoogle,
    renderGoogleButton,
    isLoading: isLoading || localLoading,
    error,
    isAuthenticated,
    isReady: isGoogleReady,
  };
}
