import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ 虛擬主機 API 根網址
const API_BASE_URL = 'https://curiouscreate.com/api';

class ApiService {
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
  // 通用 API 請求（含完整除錯輸出）
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

  // ==========================================
  // 認證相關 API
  // ==========================================

  /** 註冊新用戶 */
  async register(name, email, password) {
    return this.request('/register.php', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  /** 登入 */
  async login(email, password) {
    const data = await this.request('/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      await this.saveToken(data.token);
    }

    return data;
  }

  /** 登出 */
  async logout() {
    await this.clearToken();
    console.log('👋 已登出');
  }

  /** 忘記密碼 - 發送重設郵件 */
  async forgotPassword(email) {
    return this.request('/forgot-password.php', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /** 重設密碼 */
  async resetPassword(token, newPassword) {
    return this.request('/reset-password.php', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // ==========================================
  // 用戶相關 API
  // ==========================================

  /** 取得用戶資料 */
  async getUserProfile() {
    return this.request('/user/profile.php', {
      method: 'GET',
    });
  }

  // ==========================================
  // 練習相關 API
  // ==========================================

  /** 紀錄練習完成 */
  async completePractice(practiceType, duration) {
    return this.request('/practice/complete.php', {
      method: 'POST',
      body: JSON.stringify({ practiceType, duration }),
    });
  }

  /** 取得練習歷史 */
  async getPracticeHistory() {
    return this.request('/practice/history.php', {
      method: 'GET',
    });
  }

  // ==========================================
  // 測試連線
  // ==========================================

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
const apiService = new ApiService();
export default apiService;

// ==========================================
// 使用範例
// ==========================================

/*
import ApiService from './api';

// 註冊
const handleRegister = async () => {
  try {
    const response = await ApiService.register('張三', 'test@example.com', '123456');
    console.log('✅ 註冊成功:', response);
  } catch (error) {
    console.error('❌ 註冊失敗:', error.message);
  }
};

// 登入
const handleLogin = async () => {
  try {
    const response = await ApiService.login('test@example.com', '123456');
    console.log('✅ 登入成功:', response);
  } catch (error) {
    console.error('❌ 登入失敗:', error.message);
  }
};

// 取得用戶資料
const fetchUserProfile = async () => {
  try {
    const response = await ApiService.getUserProfile();
    console.log('👤 用戶資料:', response.user);
  } catch (error) {
    console.error('❌ 獲取資料失敗:', error.message);
  }
};

// 測試 API
const testAPI = async () => {
  await ApiService.testConnection();
};
*/
