// ==========================================
// 檔案名稱: AuthUtils.js
// 功能: 認證相關工具函數
// ✅ Token 自動過期機制（30 天）
// ✅ 自動登入邏輯
// ✅ 清除登入狀態
// ✅ 正確保存和檢查 authToken
// 版本: v2.0 - 最終修正版
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage Keys
export const AUTH_STORAGE_KEYS = {
  REMEMBERED_EMAIL: 'remembered_email',
  USER_DATA: 'userData',
  LOGIN_TIMESTAMP: 'login_timestamp',
  AUTH_TOKEN: 'authToken',
};

// Token 有效期：30 天（單位：毫秒）
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
    const authToken = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    
    // ✅ 檢查三個必要資料是否都存在
    if (!userDataStr || !loginTimestamp || !authToken) {
      console.log('📝 [AuthUtils] 無完整登入資料，需要手動登入');
      console.log(`   userData: ${!!userDataStr}, timestamp: ${!!loginTimestamp}, token: ${!!authToken}`);
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
    
    // ✅ 檢查 token 是否過期（30 天）
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
    
    // ✅ 確保用戶資料有效且不是訪客
    if (userData && userData.id && !userData.isGuest) {
      const remainingDays = Math.floor((TOKEN_EXPIRY_MS - elapsedTime) / (24 * 60 * 60 * 1000));
      console.log('✅ [AuthUtils] Token 有效，自動登入');
      console.log(`   登入時間: ${new Date(loginTime).toLocaleString()}`);
      console.log(`   剩餘天數: ${remainingDays} 天`);
      console.log(`   Token 前綴: ${authToken.substring(0, 20)}...`);
      
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
 * ⭐ 此函數會清除所有認證相關資料
 * @param {boolean} keepRememberedEmail - 是否保留記住的帳號（預設保留）
 */
export const clearLoginState = async (keepRememberedEmail = true) => {
  try {
    console.log('🧹 [AuthUtils] 開始清除登入狀態...');
    
    // ✅ 清除用戶資料
    await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
    console.log('   ✓ userData 已清除');
    
    // ✅ 清除登入時間戳記
    await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP);
    console.log('   ✓ login_timestamp 已清除');
    
    // ✅ 清除 authToken
    await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    console.log('   ✓ authToken 已清除');
    
    // ✅ 根據參數決定是否清除記住的帳號
    if (!keepRememberedEmail) {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
      console.log('   ✓ remembered_email 已清除');
    } else {
      console.log('   ⊙ remembered_email 保留');
    }
    
    console.log('✅ [AuthUtils] 登入狀態已完全清除');
  } catch (error) {
    console.error('❌ [AuthUtils] 清除登入狀態失敗:', error);
    throw error; // 拋出錯誤讓調用者知道清除失敗
  }
};

/**
 * 設定登入狀態
 * ⭐ 此函數會保存所有必要的認證資料
 * @param {object} options
 * @param {object} options.userData - 用戶資料
 * @param {string} options.token - API Token（必須）
 * @param {boolean} options.rememberMe - 記住我（用於記住帳號）
 */
export const setLoginState = async ({ userData, token, rememberMe }) => {
  try {
    console.log('💾 [AuthUtils] 開始設定登入狀態...');
    
    // ✅ 驗證必要參數
    if (!userData || !token) {
      console.error('❌ [AuthUtils] 缺少必要參數！userData 和 token 都必須提供');
      throw new Error('setLoginState: 缺少必要參數');
    }
    
    // ✅ 儲存用戶資料
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    console.log('   ✓ userData 已儲存');
    
    // ✅ 儲存 authToken
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TOKEN, token);
    console.log('   ✓ authToken 已儲存:', token.substring(0, 20) + '...');
    
    // ✅ 儲存登入時間戳記（用於計算過期時間）
    const loginTimestamp = Date.now().toString();
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP, loginTimestamp);
    console.log('   ✓ login_timestamp 已儲存');
    
    // ✅ 處理「記住我」功能
    if (rememberMe && userData?.email) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL, userData.email);
      console.log('   ✓ remembered_email 已儲存:', userData.email);
    } else if (!rememberMe) {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
      console.log('   ✓ remembered_email 已清除（未勾選記住我）');
    }
    
    console.log('✅ [AuthUtils] 登入狀態設定完成');
    console.log(`   登入時間: ${new Date(parseInt(loginTimestamp)).toLocaleString()}`);
    console.log(`   記住帳號: ${rememberMe ? '是' : '否'}`);
    console.log(`   有效期限: ${TOKEN_EXPIRY_DAYS} 天`);
  } catch (error) {
    console.error('❌ [AuthUtils] 設定登入狀態失敗:', error);
    throw error; // 拋出錯誤讓調用者知道設定失敗
  }
};

/**
 * 獲取記住的帳號
 * @returns {Promise<string|null>}
 */
export const getRememberedEmail = async () => {
  try {
    const email = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
    if (email) {
      console.log('📧 [AuthUtils] 找到記住的帳號:', email);
    }
    return email;
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
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      console.log('👤 [AuthUtils] 獲取用戶資料:', userData.email);
      return userData;
    }
    return null;
  } catch (error) {
    console.error('❌ [AuthUtils] 獲取用戶資料失敗:', error);
    return null;
  }
};

/**
 * 刷新登入時間（用於延長有效期）
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

/**
 * 🔍 診斷工具：檢查 AsyncStorage 中的認證狀態
 * 用於除錯時查看所有認證相關資料
 */
export const diagnoseAuthState = async () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     🔍 認證狀態診斷報告                ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  try {
    const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
    const timestamp = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_TIMESTAMP);
    const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    const rememberedEmail = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.REMEMBERED_EMAIL);
    
    console.log('1️⃣ userData:', userData ? '✅ 存在' : '❌ 不存在');
    if (userData) {
      const parsed = JSON.parse(userData);
      console.log('   - ID:', parsed.id);
      console.log('   - Email:', parsed.email);
      console.log('   - Name:', parsed.name);
    }
    
    console.log('\n2️⃣ login_timestamp:', timestamp ? '✅ 存在' : '❌ 不存在');
    if (timestamp) {
      const date = new Date(parseInt(timestamp));
      console.log('   - 時間:', date.toLocaleString());
      const elapsed = Date.now() - parseInt(timestamp);
      const days = Math.floor(elapsed / (24 * 60 * 60 * 1000));
      console.log('   - 經過:', days, '天');
    }
    
    console.log('\n3️⃣ authToken:', token ? '✅ 存在' : '❌ 不存在');
    if (token) {
      console.log('   - 長度:', token.length);
      console.log('   - 前綴:', token.substring(0, 30) + '...');
    }
    
    console.log('\n4️⃣ remembered_email:', rememberedEmail ? '✅ 存在' : '❌ 不存在');
    if (rememberedEmail) {
      console.log('   - Email:', rememberedEmail);
    }
    
    console.log('\n════════════════════════════════════════\n');
    
    return {
      hasUserData: !!userData,
      hasTimestamp: !!timestamp,
      hasToken: !!token,
      hasRememberedEmail: !!rememberedEmail,
    };
  } catch (error) {
    console.error('❌ 診斷過程出錯:', error);
    return null;
  }
};

// ==========================================
// 默認導出
// ==========================================
export default {
  AUTH_STORAGE_KEYS,
  TOKEN_EXPIRY_DAYS,
  checkAutoLogin,
  clearLoginState,
  setLoginState,
  getRememberedEmail,
  getCurrentUserData,
  refreshLoginTimestamp,
  diagnoseAuthState, // ⭐ 新增診斷工具
};