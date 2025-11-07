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
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('❌ 獲取 Token 失敗:', error);
      return null;
    }
  }

  /** 儲存 Token */
  async saveToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);
      console.log('💾 Token 已儲存');
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
    return token !== null;
  }

  // ==========================================
  // 通用 API 請求
  // ==========================================

  async request(endpoint, options = {}) {
    const token = await this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log(`\n🚀 [API 請求] ${options.method || 'GET'} ${fullUrl}`);
      console.log('📦 傳送內容:', options.body || '(無)');

      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      const status = response.status;
      const text = await response.text();
      console.log(`📥 [API 回應] ${endpoint} (${status}) 原始內容:`, text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn(`⚠️ 無法解析 JSON (${endpoint}):`, e.message);
        throw new Error(`伺服器回傳格式錯誤（不是 JSON）: ${text}`);
      }

      if (!response.ok) {
        console.error(`❌ [HTTP ${status}] 錯誤回應:`, data);
        throw new Error(data.error || `HTTP Error: ${status}`);
      }

      console.log(`✅ [API 成功] ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`🔥 [API 請求錯誤] ${endpoint}:`, error.message);
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
}

// 匯出單例
const apiClient = new ApiClient();
export default apiClient;