// src/services/api/client.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 根網址
export const API_BASE_URL = 'https://curiouscreate.com/api';

class ApiClient {
  // ==========================================
  // Token 管理
  // ==========================================

  /** 取得 Token */
  async getToken() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      // 添加診斷日誌
      if (token) {
        console.log('🔑 Token 已找到:', token.substring(0, 15) + '...');
      } else {
        console.log('⚠️ Token 不存在，可能需要登入');
      }
      return token;
    } catch (error) {
      console.error('❌ 獲取 Token 失敗:', error);
      return null;
    }
  }

  /** 儲存 Token */
  async saveToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);
      console.log('💾 Token 已儲存:', token.substring(0, 15) + '...');
    } catch (error) {
      console.error('❌ 儲存 Token 失敗:', error);
    }
  }

  /** 清除 Token */
  async clearToken() {
    try {
      await AsyncStorage.removeItem('authToken');
      console.log('🧹 Token 已清除');
    } catch (error) {
      console.error('❌ 清除 Token 失敗:', error);
    }
  }

  /** 是否已登入 */
  async isLoggedIn() {
    const token = await this.getToken();
    const loggedIn = token !== null;
    console.log('🔐 登入狀態:', loggedIn ? '✅ 已登入' : '❌ 未登入');
    return loggedIn;
  }

  // ==========================================
  // 通用 API 請求
  // ==========================================

  async request(endpoint, options = {}) {
    console.log('\n========================================');
    console.log('🚀 開始 API 請求:', endpoint);
    console.log('========================================');
    
    const token = await this.getToken();
    
    // ✅ 顯示 token 狀態
    if (token) {
      console.log('🔑 Token 狀態: ✅ 存在');
      console.log('📝 Token 內容 (前20字):', token.substring(0, 20) + '...');
    } else {
      console.log('🔑 Token 狀態: ❌ 不存在 (需要登入)');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ 已添加 Authorization header');
    } else {
      console.log('⚠️ 未添加 Authorization header (沒有 token)');
    }

    // ⭐⭐⭐ 關鍵修改：確保 body 被正確序列化 ⭐⭐⭐
    let body = undefined;
    if (options.body) {
      // 如果 body 已經是字串，直接使用
      if (typeof options.body === 'string') {
        body = options.body;
      } else {
        // 否則轉換為 JSON 字串
        body = JSON.stringify(options.body);
      }
      console.log('📦 Body 已序列化，長度:', body.length);
    }

    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log(`\n📡 [API 請求] ${options.method || 'GET'} ${fullUrl}`);
      
      // ✅ 顯示完整的 headers (但隱藏完整 token)
      const safeHeaders = { ...headers };
      if (safeHeaders['Authorization']) {
        const authValue = safeHeaders['Authorization'];
        safeHeaders['Authorization'] = authValue.substring(0, 20) + '...';
      }
      console.log('📋 Request Headers:', JSON.stringify(safeHeaders, null, 2));
      
      // 顯示原始 body 對象（序列化前）
      console.log('📦 傳送內容:', options.body || '(無)');

      const response = await fetch(fullUrl, {
        method: options.method || 'GET',
        headers,
        body,  // ⭐ 使用已序列化的 body
      });

      const status = response.status;
      const text = await response.text();
      console.log(`\n📥 [API 回應] ${endpoint}`);
      console.log('📊 狀態碼:', status);
      console.log('📄 回應內容:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn(`⚠️ 無法解析 JSON (${endpoint}):`, e.message);
        throw new Error(`伺服器回傳格式錯誤（不是 JSON）: ${text}`);
      }

      if (!response.ok) {
        console.error(`\n❌❌❌ [HTTP ${status}] 請求失敗 ❌❌❌`);
        console.error('錯誤詳情:', data);
        
        // 特別處理 401 錯誤
        if (status === 401) {
          console.error('\n🚨 認證失敗 (401 Unauthorized)');
          console.error('可能原因:');
          console.error('  1. Token 不存在或已過期');
          console.error('  2. Token 格式不正確');
          console.error('  3. 後端 API 期望不同的 header 格式');
          console.error('\n建議動作: 請重新登入');
        }
        
        throw new Error(data.error || data.message || `HTTP Error: ${status}`);
      }

      console.log(`✅ [API 成功] ${endpoint}`);
      console.log('========================================\n');
      return data;
    } catch (error) {
      console.error(`\n🔥🔥🔥 [API 請求錯誤] ${endpoint} 🔥🔥🔥`);
      console.error('錯誤訊息:', error.message);
      console.error('========================================\n');
      throw error;
    }
  }

  /** 測試連線 */
  async testConnection() {
    try {
      const fullUrl = `${API_BASE_URL}/register.php`;
      console.log(`🔍 測試 API 連線: ${fullUrl}`);
      const res = await fetch(fullUrl);
      const text = await res.text();
      console.log('🧩 伺服器回應內容:', text);
      return true;
    } catch (error) {
      console.error('❌ API 連線測試失敗:', error);
      return false;
    }
  }

  // ==========================================
  // 🔍 診斷工具
  // ==========================================

  /** 診斷認證狀態 - 用於除錯 */
  async diagnoseAuth() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     🔍 認證狀態診斷報告                ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    try {
      // 檢查 token
      const token = await AsyncStorage.getItem('authToken');
      console.log('1️⃣ Token 檢查:');
      if (token) {
        console.log('   ✅ Token 存在');
        console.log('   📝 Token 長度:', token.length);
        console.log('   📝 Token 前綴:', token.substring(0, 20) + '...');
      } else {
        console.log('   ❌ Token 不存在');
        console.log('   💡 建議: 需要重新登入');
      }
      
      // 檢查登入狀態
      console.log('\n2️⃣ 登入狀態:');
      const loggedIn = await this.isLoggedIn();
      console.log('   狀態:', loggedIn ? '✅ 已登入' : '❌ 未登入');
      
      // 檢查 AsyncStorage
      console.log('\n3️⃣ AsyncStorage 檢查:');
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('   所有儲存的 keys:', allKeys);
      
      console.log('\n════════════════════════════════════════\n');
      
      return {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        isLoggedIn: loggedIn,
        allKeys: allKeys
      };
    } catch (error) {
      console.error('❌ 診斷過程出錯:', error);
      return null;
    }
  }
}

// 匯出單例
const apiClient = new ApiClient();
export default apiClient;