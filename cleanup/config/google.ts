// Google OAuth Configuration
// 
// ============================================
// SETUP FOR MOBILE (Expo Go)
// ============================================
// 
// For Expo Go development, you need to create OAuth credentials
// in Google Cloud Console (project 910844602667):
//
// 1. Go to APIs & Services > Credentials
// 2. Create OAuth 2.0 Client ID:
//    - For iOS: Select "iOS" type, add Bundle ID from app.json
//    - For Android: Select "Android" type, add package name and SHA-1
//
// To get SHA-1 for Expo Go on Android:
//   - Expo Go uses a shared keystore
//   - SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
//
// ============================================
// SETUP FOR WEB
// ============================================
//
// Add to Authorized JavaScript origins:
//   - http://localhost:8081
//   - http://localhost
//   - Your production domain
//
// ============================================

export const GOOGLE_CONFIG = {
  // Web Client ID - used for web and as fallback
  webClientId: '910844602667-qs83i1fpu6v36ecd3ku1tav0kt8njc2l.apps.googleusercontent.com',
  
  // iOS Client ID - create in Google Cloud Console for iOS app
  // Leave same as webClientId if not created yet
  iosClientId: '910844602667-1042hdgna380vpa89ggk9jh78n7gf0qa.apps.googleusercontent.com',
  
  // Android Client ID - create in Google Cloud Console for Android app
  // Leave same as webClientId if not created yet
  androidClientId: '910844602667-7err6hi75j0sb899h4gnoaglt7ur1d3p.apps.googleusercontent.com',
};

// Check if Google is configured
export const isGoogleConfigured = () => {
  return GOOGLE_CONFIG.webClientId && !GOOGLE_CONFIG.webClientId.includes('YOUR_');
};
