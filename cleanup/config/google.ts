// Google OAuth Configuration
// 
// ============================================
// HƯỚNG DẪN CẤU HÌNH GOOGLE OAUTH
// ============================================
//
// BƯỚC 1: Tạo Project trên Google Cloud Console
// - Truy cập: https://console.cloud.google.com/
// - Tạo project mới hoặc chọn project có sẵn
//
// BƯỚC 2: Cấu hình OAuth Consent Screen
// - Vào "APIs & Services" > "OAuth consent screen"
// - Chọn "External" (hoặc "Internal" nếu dùng Google Workspace)
// - Điền thông tin app: App name, User support email, Developer contact
// - Thêm scopes: email, profile, openid
// - Thêm test users (email của bạn) nếu app đang ở chế độ Testing
//
// BƯỚC 3: Tạo OAuth Client ID
// - Vào "APIs & Services" > "Credentials"
// - Click "Create Credentials" > "OAuth client ID"
//
// CHO EXPO GO (Development):
//   - Application type: "Web application"
//   - Name: "Cleanup Expo"
//   - Authorized JavaScript origins: 
//       https://auth.expo.io
//   - Authorized redirect URIs: 
//       https://auth.expo.io/@YOUR_EXPO_USERNAME/cleanup
//   - Thay YOUR_EXPO_USERNAME bằng username Expo của bạn
//   - Copy Client ID vào webClientId bên dưới
//
// CHO ANDROID (Production):
//   - Application type: "Android"
//   - Package name: com.cleanup.app (hoặc từ app.json)
//   - SHA-1: Lấy từ keystore (xem lệnh bên dưới)
//
// CHO iOS (Production):
//   - Application type: "iOS"  
//   - Bundle ID: com.cleanup.app (hoặc từ app.json)
//
// ============================================
// LẤY SHA-1 CHO ANDROID:
// Debug keystore:
//   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
// 
// Expo development build:
//   eas credentials (chọn Android > Keystore > View credentials)
// ============================================

export const GOOGLE_CONFIG = {
  // Web Client ID - BẮT BUỘC cho Expo Go
  // Đây phải là OAuth client loại "Web application"
  webClientId: '910844602667-qs83i1fpu6v36ecd3ku1tav0kt8njc2l.apps.googleusercontent.com',
  
  // iOS Client ID - cho iOS standalone builds
  iosClientId: '910844602667-qs83i1fpu6v36ecd3ku1tav0kt8njc2l.apps.googleusercontent.com',
  
  // Android Client ID - cho Android standalone builds  
  androidClientId: '910844602667-qs83i1fpu6v36ecd3ku1tav0kt8njc2l.apps.googleusercontent.com',
};

// Kiểm tra xem đã cấu hình chưa
export const isGoogleConfigured = () => {
  return !GOOGLE_CONFIG.webClientId.includes('YOUR_');
};
