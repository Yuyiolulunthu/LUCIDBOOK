// ==========================================
// 檔案名稱: BiometricUtils.js
// 功能: 生物識別工具模組
// ✅ 安全儲存憑證
// ✅ 生物識別驗證
// ✅ 啟用/停用管理
// ✅ iOS Face ID 完整支援
// ==========================================

import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

// ====================================
// 檢查生物識別可用性
// ====================================
export const checkBiometricAvailability = async () => {
  try {
    console.log('🔍 [BiometricUtils] 開始檢查生物識別可用性...');
    console.log('📱 [BiometricUtils] 平台:', Platform.OS);
    
    // 1. 檢查硬體支援
    const compatible = await LocalAuthentication.hasHardwareAsync();
    console.log('🔧 [BiometricUtils] 硬體支援:', compatible);
    
    if (!compatible) {
      return {
        available: false,
        type: null,
        reason: '您的裝置不支援生物識別'
      };
    }
    
    // 2. 檢查是否已註冊生物識別
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    console.log('👆 [BiometricUtils] 已註冊生物識別:', enrolled);
    
    if (!enrolled) {
      return {
        available: false,
        type: null,
        reason: Platform.OS === 'ios' 
          ? '請先在系統設定中設定 Face ID 或 Touch ID'
          : '請先在系統設定中設定指紋或臉部辨識'
      };
    }
    
    // 3. 取得支援的類型
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    console.log('📋 [BiometricUtils] 支援的驗證類型:', types);
    
    let biometricType = 'biometric';
    
    // iOS 使用 Face ID 或 Touch ID
    if (Platform.OS === 'ios') {
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'face';
        console.log('✅ [BiometricUtils] iOS 偵測到 Face ID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
        console.log('✅ [BiometricUtils] iOS 偵測到 Touch ID');
      }
    } 
    // Android 使用指紋或臉部辨識
    else {
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
        console.log('✅ [BiometricUtils] Android 偵測到指紋');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'face';
        console.log('✅ [BiometricUtils] Android 偵測到臉部辨識');
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
        console.log('✅ [BiometricUtils] Android 偵測到虹膜');
      }
    }
    
    console.log('✅ [BiometricUtils] 生物識別可用:', biometricType);
    
    return {
      available: true,
      type: biometricType,
      reason: null
    };
  } catch (error) {
    console.error('❌ [BiometricUtils] 檢查生物識別可用性失敗:', error);
    return {
      available: false,
      type: null,
      reason: '無法檢查生物識別功能'
    };
  }
};

// ====================================
// 取得生物識別類型的顯示文字
// ====================================
export const getBiometricTypeText = (type) => {
  switch (type) {
    case 'face':
      return Platform.OS === 'ios' ? 'Face ID' : '臉部辨識';
    case 'fingerprint':
      return Platform.OS === 'ios' ? 'Touch ID' : '指紋';
    case 'iris':
      return '虹膜';
    default:
      return '生物識別';
  }
};

// ====================================
// 取得生物識別類型的圖標
// ====================================
export const getBiometricTypeIcon = (type) => {
  switch (type) {
    case 'face':
      return Platform.OS === 'ios' ? 'scan' : 'scan';
    case 'fingerprint':
      return 'finger-print';
    case 'iris':
      return 'eye';
    default:
      return 'lock-open';
  }
};

// ====================================
// 儲存生物識別憑證
// ====================================
export const saveBiometricCredentials = async (email, password) => {
  try {
    console.log('💾 [BiometricUtils] 開始儲存生物識別憑證...');
    
    // 將憑證轉換為 JSON 字串
    const credentials = JSON.stringify({ email, password });
    
    // ⭐ iOS 使用 SecureStore 的特殊選項
    const options = Platform.OS === 'ios' 
      ? { 
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          requireAuthentication: false, // 儲存時不需要驗證
        }
      : {};
    
    // 使用 SecureStore 安全儲存
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials, options);
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true', options);
    
    console.log('✅ [BiometricUtils] 生物識別憑證已安全儲存');
    return { success: true };
  } catch (error) {
    console.error('❌ [BiometricUtils] 儲存生物識別憑證失敗:', error);
    return { success: false, error: error.message };
  }
};

// ====================================
// 取得生物識別憑證
// ====================================
export const getBiometricCredentials = async () => {
  try {
    console.log('📥 [BiometricUtils] 開始取得生物識別憑證...');
    
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    console.log('🔍 [BiometricUtils] 生物識別啟用狀態:', enabled);
    
    if (enabled !== 'true') {
      return { success: false, reason: 'not_enabled' };
    }
    
    const credentialsString = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    
    if (!credentialsString) {
      console.log('❌ [BiometricUtils] 找不到儲存的憑證');
      return { success: false, reason: 'no_credentials' };
    }
    
    const credentials = JSON.parse(credentialsString);
    console.log('✅ [BiometricUtils] 成功取得憑證');
    
    return {
      success: true,
      email: credentials.email,
      password: credentials.password
    };
  } catch (error) {
    console.error('❌ [BiometricUtils] 取得生物識別憑證失敗:', error);
    return { success: false, reason: 'error', error: error.message };
  }
};

// ====================================
// 檢查是否已啟用生物識別
// ====================================
export const isBiometricEnabled = async () => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('❌ [BiometricUtils] 檢查生物識別狀態失敗:', error);
    return false;
  }
};

// ====================================
// 執行生物識別驗證
// ====================================
export const authenticateWithBiometric = async (promptMessage = '使用生物識別登入') => {
  try {
    console.log('🔐 [BiometricUtils] 開始生物識別驗證...');
    console.log('📱 [BiometricUtils] 平台:', Platform.OS);
    
    // ⭐ iOS 和 Android 的不同配置
    const options = {
      promptMessage,
      cancelLabel: '取消',
      disableDeviceFallback: false, // 允許使用密碼備援
      fallbackLabel: Platform.OS === 'ios' ? '使用密碼' : '使用密碼',
    };
    
    console.log('⚙️ [BiometricUtils] 驗證選項:', options);
    
    const result = await LocalAuthentication.authenticateAsync(options);
    
    console.log('📊 [BiometricUtils] 驗證結果:', result);

    if (result.success) {
      console.log('✅ [BiometricUtils] 生物識別驗證成功');
      return { success: true };
    } else {
      console.log('❌ [BiometricUtils] 生物識別驗證失敗:', result.error);
      return {
        success: false,
        reason: result.error || 'authentication_failed',
        message: result.error === 'user_cancel' ? '用戶取消驗證' : '驗證失敗'
      };
    }
  } catch (error) {
    console.error('❌ [BiometricUtils] 生物識別驗證錯誤:', error);
    return {
      success: false,
      reason: 'error',
      error: error.message,
      message: '驗證過程發生錯誤'
    };
  }
};

// ====================================
// 停用生物識別
// ====================================
export const disableBiometric = async () => {
  try {
    console.log('🗑️ [BiometricUtils] 開始停用生物識別...');
    
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    
    console.log('✅ [BiometricUtils] 生物識別已停用');
    return { success: true };
  } catch (error) {
    console.error('❌ [BiometricUtils] 停用生物識別失敗:', error);
    return { success: false, error: error.message };
  }
};

// ====================================
// 完整的生物識別登入流程
// ====================================
export const performBiometricLogin = async () => {
  try {
    console.log('🚀 [BiometricUtils] 開始完整生物識別登入流程...');
    
    // 1. 檢查是否已啟用
    const enabled = await isBiometricEnabled();
    if (!enabled) {
      return {
        success: false,
        reason: 'not_enabled',
        message: '尚未啟用生物識別登入'
      };
    }
    
    // 2. 執行生物識別驗證
    const authResult = await authenticateWithBiometric('使用生物識別登入');
    if (!authResult.success) {
      return {
        success: false,
        reason: 'auth_failed',
        message: authResult.message || '生物識別驗證失敗'
      };
    }
    
    // 3. 取得儲存的憑證
    const credentialsResult = await getBiometricCredentials();
    if (!credentialsResult.success) {
      return {
        success: false,
        reason: 'no_credentials',
        message: '找不到儲存的憑證'
      };
    }
    
    // 4. 返回憑證供登入使用
    console.log('✅ [BiometricUtils] 生物識別登入流程完成');
    return {
      success: true,
      email: credentialsResult.email,
      password: credentialsResult.password
    };
  } catch (error) {
    console.error('❌ [BiometricUtils] 生物識別登入流程錯誤:', error);
    return {
      success: false,
      reason: 'error',
      message: error.message || '生物識別登入失敗'
    };
  }
};

// ====================================
// 設定生物識別的完整流程
// ====================================
export const setupBiometric = async (email, password) => {
  try {
    console.log('⚙️ [BiometricUtils] 開始設定生物識別流程...');
    
    // 1. 檢查可用性
    const availability = await checkBiometricAvailability();
    if (!availability.available) {
      return {
        success: false,
        reason: 'not_available',
        message: availability.reason
      };
    }
    
    // 2. 執行驗證確認用戶身份
    const biometricText = getBiometricTypeText(availability.type);
    const authResult = await authenticateWithBiometric(
      `設定${biometricText}登入`
    );
    
    if (!authResult.success) {
      return {
        success: false,
        reason: 'auth_failed',
        message: authResult.message || '驗證失敗，請重試'
      };
    }
    
    // 3. 儲存憑證
    const saveResult = await saveBiometricCredentials(email, password);
    if (!saveResult.success) {
      return {
        success: false,
        reason: 'save_failed',
        message: '儲存憑證失敗'
      };
    }
    
    console.log('✅ [BiometricUtils] 生物識別設定完成');
    return {
      success: true,
      biometricType: availability.type,
      message: `${biometricText}登入已啟用`
    };
  } catch (error) {
    console.error('❌ [BiometricUtils] 設定生物識別失敗:', error);
    return {
      success: false,
      reason: 'error',
      message: error.message || '設定失敗'
    };
  }
};

export default {
  checkBiometricAvailability,
  getBiometricTypeText,
  getBiometricTypeIcon,
  saveBiometricCredentials,
  getBiometricCredentials,
  isBiometricEnabled,
  authenticateWithBiometric,
  disableBiometric,
  performBiometricLogin,
  setupBiometric,
};