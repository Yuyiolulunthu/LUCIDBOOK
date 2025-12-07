// ==========================================
// 檔案名稱: AuthUtils.js
// 功能: 認證相關工具函數
// ✅ 檢查「保持登入狀態」
// ✅ 處理自動登入邏輯
// ✅ 清除登入狀態
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage Keys
export const AUTH_STORAGE_KEYS = {
  REMEMBERED_EMAIL: 'remembered_email',
  STAY_LOGGED_IN: 'stay_logged_in',
  USER_DATA: 'userData',
};

/**
 * 檢查是否應該自動登入
 * @returns {Promise<{shouldAutoLogin: boolean, userData: object|null}>}
 */
export const checkAutoLogin = async () => {
  try {
    const stayLoggedIn = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.STAY_LOGGED_IN);
    const userDataStr = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
    
    if (stayLoggedIn === 'true' && userDataStr) {
      const userData = JSON.parse(userDataStr);
      
      // 確保用戶資料有效且不是訪客
      if (userData && userData.id && !userData.isGuest) {
        console.log('✅ [AuthUtils] 自動登入：用戶已勾選保持登入狀態');
        return {
          shouldAutoLogin: true,
          userData: userData,
        };
      }
    }
    
    console.log('📝 [AuthUtils] 需要手動登入');
    return {
      shouldAutoLogin: false,
      userData: null,
    };
  } catch (error) {
    console.error('❌ [AuthUtils] 檢查自動登入失敗:', error);
    return {
      shouldAutoLogin: false,
      userData: null,
    };
  }
};

/**
 * 清除登入狀態（登出時使用）
 * @param {boolean} keepRememberedEmail - 是否保留記住的帳號
 */
export const clearLoginState = async (keepRememberedEmail = true) => {
  try {
    // 清除保持登入狀態
    await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.STAY_LOGGED_IN);
    
    // 清除用戶資料
    await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
    
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
 * @param {boolean} options.rememberMe - 記住我
 * @param {boolean} options.stayLoggedIn - 保持登入狀態
 */
export const setLoginState = async ({ userData, rememberMe, stayLoggedIn }) => {
  try {
    // 儲存用戶資料
    if (userData) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
    
    // 儲存記住帳號
    if (rememberMe && userData?.email) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL, userData.email);
    } else if (!rememberMe) {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
    }
    
    // 儲存保持登入狀態
    await AsyncStorage.setItem(
      AUTH_STORAGE_KEYS.STAY_LOGGED_IN, 
      stayLoggedIn ? 'true' : 'false'
    );
    
    console.log('✅ [AuthUtils] 登入狀態已設定:', { rememberMe, stayLoggedIn });
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

export default {
  AUTH_STORAGE_KEYS,
  checkAutoLogin,
  clearLoginState,
  setLoginState,
  getRememberedEmail,
  getCurrentUserData,
};