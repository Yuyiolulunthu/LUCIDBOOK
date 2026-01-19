// ==========================================
// 檔案名稱: BiometricUtils.js
// 功能: 生物識別工具模組
// ✅ 安全儲存憑證
// ✅ 生物識別驗證
// ✅ 啟用/停用管理
// ==========================================

import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

// ====================================
// 檢查生物識別可用性
// ====================================
export const checkBiometricAvailability = async () => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (!compatible) {
      return {
        available: false,
        type: null,
        reason: '您的裝置不支援生物識別'
      };
    }
    
    if (!enrolled) {
      return {
        available: false,
        type: null,
        reason: '請先在系統設定中設定 Face ID 或指紋'
      };
    }
    
    // 取得支援的類型
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    let biometricType = 'biometric';
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'face';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
    }
    
    return {
      available: true,
      type: biometricType,
      reason: null
    };
  } catch (error) {
    console.error('檢查生物識別可用性失敗:', error);
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
      return 'Face ID';
    case 'fingerprint':
      return '指紋';
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
      return 'scan';
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
    // 將憑證轉換為 JSON 字串
    const credentials = JSON.stringify({ email, password });
    
    // 使用 SecureStore 安全儲存
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    
    console.log('✅ 生物識別憑證已安全儲存');
    return { success: true };
  } catch (error) {
    console.error('❌ 儲存生物識別憑證失敗:', error);
    return { success: false, error: error.message };
  }
};

// ====================================
// 取得生物識別憑證
// ====================================
export const getBiometricCredentials = async () => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    
    if (enabled !== 'true') {
      return { success: false, reason: 'not_enabled' };
    }
    
    const credentialsString = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    
    if (!credentialsString) {
      return { success: false, reason: 'no_credentials' };
    }
    
    const credentials = JSON.parse(credentialsString);
    
    return {
      success: true,
      email: credentials.email,
      password: credentials.password
    };
  } catch (error) {
    console.error('❌ 取得生物識別憑證失敗:', error);
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
    console.error('❌ 檢查生物識別狀態失敗:', error);
    return false;
  }
};

// ====================================
// 執行生物識別驗證
// ====================================
export const authenticateWithBiometric = async (promptMessage = '使用生物識別登入') => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: '取消',
      fallbackLabel: '使用密碼',
      disableDeviceFallback: false,
    });

    if (result.success) {
      console.log('✅ 生物識別驗證成功');
      return { success: true };
    } else {
      console.log('❌ 生物識別驗證失敗:', result.error);
      return {
        success: false,
        reason: result.error || 'authentication_failed'
      };
    }
  } catch (error) {
    console.error('❌ 生物識別驗證錯誤:', error);
    return {
      success: false,
      reason: 'error',
      error: error.message
    };
  }
};

// ====================================
// 停用生物識別
// ====================================
export const disableBiometric = async () => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    
    console.log('✅ 生物識別已停用');
    return { success: true };
  } catch (error) {
    console.error('❌ 停用生物識別失敗:', error);
    return { success: false, error: error.message };
  }
};

// ====================================
// 完整的生物識別登入流程
// ====================================
export const performBiometricLogin = async () => {
  try {
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
        message: '生物識別驗證失敗'
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
    return {
      success: true,
      email: credentialsResult.email,
      password: credentialsResult.password
    };
  } catch (error) {
    console.error('❌ 生物識別登入流程錯誤:', error);
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
    const authResult = await authenticateWithBiometric(
      `設定${getBiometricTypeText(availability.type)}登入`
    );
    
    if (!authResult.success) {
      return {
        success: false,
        reason: 'auth_failed',
        message: '驗證失敗，請重試'
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
    
    return {
      success: true,
      biometricType: availability.type,
      message: `${getBiometricTypeText(availability.type)}登入已啟用`
    };
  } catch (error) {
    console.error('❌ 設定生物識別失敗:', error);
    return {
      success: false,
      reason: 'error',
      message: error.message || '設定失敗'
    };
  }
};