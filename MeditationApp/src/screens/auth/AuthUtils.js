// ==========================================
// 檔案名稱: AuthUtils.js
// 功能: 認證相關工具函數
// ✅ Token 自動過期機制（30 天）
// ✅ 自動登入邏輯
// ✅ 清除登入狀態
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage Keys
export const AUTH_STORAGE_KEYS = {
  REMEMBERED_EMAIL: 'remembered_email',
  USER_DATA: 'userData',
  LOGIN_TIMESTAMP: 'login_timestamp', // ⭐ 新增：記錄登入時間
};

// ⭐ Token 有效期：30 天（單位：毫秒）
const TOKEN_EXPIRY_DAYS = 30;
const TOKEN_EXPIRY_MS = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/**
 * 檢查是否應該自動登入
 * @returns {Promise<{shouldAutoLogin: boolean, userData: object|null, isExpired: boolean}>}
 */
export const checkAutoLogin = async () => {
  try {
    const userDataStr = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
    const loginTimestamp = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP);
    
    if (!userDataStr || !loginTimestamp) {
      console.log('📝 [AuthUtils] 無登入資料，需要手動登入');
      return {
        shouldAutoLogin: false,
        userData: null,
        isExpired: true,
      };
    }
    
    const userData = JSON.parse(userDataStr);
    const loginTime = parseInt(loginTimestamp);
    const currentTime = Date.now();
    const elapsedTime = currentTime - loginTime;
    
    // ⭐ 檢查 token 是否過期（30 天）
    if (elapsedTime > TOKEN_EXPIRY_MS) {
      console.log('⏰ [AuthUtils] Token 已過期，需要重新登入');
      console.log(`   登入時間: ${new Date(loginTime).toLocaleString()}`);
      console.log(`   已過時間: ${Math.floor(elapsedTime / (24 * 60 * 60 * 1000))} 天`);
      
      // 清除過期的登入資料
      await clearLoginState(true); // 保留記住的帳號
      
      return {
        shouldAutoLogin: false,
        userData: null,
        isExpired: true,
      };
    }
    
    // 確保用戶資料有效且不是訪客
    if (userData && userData.id && !userData.isGuest) {
      const remainingDays = Math.floor((TOKEN_EXPIRY_MS - elapsedTime) / (24 * 60 * 60 * 1000));
      console.log('✅ [AuthUtils] Token 有效，自動登入');
      console.log(`   登入時間: ${new Date(loginTime).toLocaleString()}`);
      console.log(`   剩餘天數: ${remainingDays} 天`);
      
      return {
        shouldAutoLogin: true,
        userData: userData,
        isExpired: false,
      };
    }
    
    console.log('📝 [AuthUtils] 用戶資料無效，需要手動登入');
    return {
      shouldAutoLogin: false,
      userData: null,
      isExpired: true,
    };
  } catch (error) {
    console.error('❌ [AuthUtils] 檢查自動登入失敗:', error);
    return {
      shouldAutoLogin: false,
      userData: null,
      isExpired: true,
    };
  }
};

/**
 * 清除登入狀態（登出時使用）
 * @param {boolean} keepRememberedEmail - 是否保留記住的帳號
 */
export const clearLoginState = async (keepRememberedEmail = true) => {
  try {
    // 清除用戶資料
    await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
    
    // ⭐ 清除登入時間戳記
    await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP);
    
    // 如果不保留記住的帳號，也清除
    if (!keepRememberedEmail) {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
    }
    
    console.log('✅ [AuthUtils] 登入狀態已清除');
  } catch (error) {
    console.error('❌ [AuthUtils] 清除登入狀態失敗:', error);
  }
};

/**
 * 設定登入狀態
 * @param {object} options
 * @param {object} options.userData - 用戶資料
 * @param {boolean} options.rememberMe - 記住我（用於記住帳號）
 */
export const setLoginState = async ({ userData, rememberMe }) => {
  try {
    // ⭐ 儲存用戶資料
    if (userData) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
    
    // ⭐ 儲存登入時間戳記（用於計算過期時間）
    const loginTimestamp = Date.now().toString();
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP, loginTimestamp);
    
    // 儲存記住帳號
    if (rememberMe && userData?.email) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL, userData.email);
    } else if (!rememberMe) {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
    }
    
    console.log('✅ [AuthUtils] 登入狀態已設定');
    console.log(`   登入時間: ${new Date(parseInt(loginTimestamp)).toLocaleString()}`);
    console.log(`   記住帳號: ${rememberMe ? '是' : '否'}`);
    console.log(`   有效期限: ${TOKEN_EXPIRY_DAYS} 天`);
  } catch (error) {
    console.error('❌ [AuthUtils] 設定登入狀態失敗:', error);
  }
};

/**
 * 獲取記住的帳號
 * @returns {Promise<string|null>}
 */
export const getRememberedEmail = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
  } catch (error) {
    console.error('❌ [AuthUtils] 獲取記住的帳號失敗:', error);
    return null;
  }
};

/**
 * 獲取當前用戶資料
 * @returns {Promise<object|null>}
 */
export const getCurrentUserData = async () => {
  try {
    const userDataStr = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
    return userDataStr ? JSON.parse(userDataStr) : null;
  } catch (error) {
    console.error('❌ [AuthUtils] 獲取用戶資料失敗:', error);
    return null;
  }
};

/**
 * ⭐ 刷新登入時間（用於延長有效期）
 * 如果用戶頻繁使用 app，可以選擇性地刷新登入時間
 */
export const refreshLoginTimestamp = async () => {
  try {
    const loginTimestamp = Date.now().toString();
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP, loginTimestamp);
    console.log('🔄 [AuthUtils] 已刷新登入時間');
  } catch (error) {
    console.error('❌ [AuthUtils] 刷新登入時間失敗:', error);
  }
};

export default {
  AUTH_STORAGE_KEYS,
  TOKEN_EXPIRY_DAYS,
  checkAutoLogin,
  clearLoginState,
  setLoginState,
  getRememberedEmail,
  getCurrentUserData,
  refreshLoginTimestamp,
};