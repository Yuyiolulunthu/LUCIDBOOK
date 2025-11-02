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

  /** 驗證重設密碼令牌 */
  async validateResetToken(token) {
    return this.request('/validate-reset-token.php', {
      method: 'POST',
      body: JSON.stringify({ token }),
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
  // ⭐ 練習相關 API（時間追蹤 + 重複練習）
  // ==========================================

  /** 
   * ⭐ 開始練習 - 創建或恢復練習記錄
   * 會檢查是否有未完成的同天同類型練習
   * @param {string} practiceType - 練習類型
   * @returns {Promise<{practiceId, currentPage, totalPages, formData}>}
   */
  async startPractice(practiceType) {
    return this.request('/practice/start.php', {
      method: 'POST',
      body: JSON.stringify({ 
        practice_type: practiceType 
      }),
    });
  }

  /**
   * ⭐ 完成練習 - 記錄實際投入時間
   * @param {number} practiceId - 練習記錄 ID
   * @param {object} data - 練習數據
   * @param {number} data.duration - 實際投入時間（分鐘）
   * @param {string} data.feeling - 感受
   * @param {string} data.noticed - 發現
   * @param {string} data.reflection - 反思
   * @param {object} data.emotionData - 情緒日記資料（情緒理解力練習用）
   */
  async completePractice(practiceId, data) {
    return this.request('/practice/complete.php', {
      method: 'POST',
      body: JSON.stringify({
        practice_id: practiceId,
        duration_seconds: data.duration_seconds || 0,  // ⭐ 新增：精確秒數
        duration: data.duration,
        feeling: data.feeling || null,
        noticed: data.noticed || null,
        reflection: data.reflection || null,
        emotion_data: data.emotion_data || null,  // ⭐ 修正：改為 emotion_data
      }),
    });
  }

  /**
   * ⭐ 更新練習進度（中途保存）
   * @param {number} practiceId - 練習記錄 ID
   * @param {number} currentPage - 當前頁面
   * @param {number} totalPages - 總頁數
   * @param {object} formData - 表單資料
   * @param {number} accumulatedSeconds - 累積時間（秒）
   */
  async updatePracticeProgress(practiceId, currentPage, totalPages, formData, accumulatedSeconds = null) {
    const requestBody = {
      practice_id: practiceId,
      current_page: currentPage,
      total_pages: totalPages,
      form_data: formData,
    };
    
    // ⭐ 如果有累積時間，加入請求
    if (accumulatedSeconds !== null && accumulatedSeconds !== undefined) {
      requestBody.accumulated_seconds = accumulatedSeconds;
    }
    
    return this.request('/practice/update-progress.php', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }
  /** 
   * 取得練習歷史
   * @returns {Promise<{practices: Array}>}
   */
  async getPracticeHistory() {
    return this.request('/practice/history.php', {
      method: 'GET',
    });
  }

  /** 
   * 取得今日練習狀態
   * @returns {Promise<{practices: Object}>}
   */
  async getTodayPracticeStatus() {
    return this.request('/practice/today-status.php', {
      method: 'GET',
    });
  }

  // ==========================================
  // ⭐ 情緒日記相關 API
  // ==========================================

  /** 
   * ⭐ 儲存情緒日記
   * @param {object} diaryData - 情緒日記資料
   */
  async saveEmotionDiary(diaryData) {
    return this.request('/emotion-diary/save.php', {
      method: 'POST',
      body: JSON.stringify(diaryData),
    });
  }

  /** 
   * 取得今日情緒日記
   * @returns {Promise<{diary: Object}>}
   */
  async getTodayEmotionDiary() {
    return this.request('/emotion-diary/today.php', {
      method: 'GET',
    });
  }

  // ==========================================
  // ⭐ 心情相關 API
  // ==========================================

  /** 
   * 記錄今日心情
   * @param {number} moodLevel - 心情等級（1-5）
   * @param {string} moodName - 心情名稱
   * @param {string} note - 備註
   */
  async recordMood(moodLevel, moodName, note = '') {
    return this.request('/mood/record.php', {
      method: 'POST',
      body: JSON.stringify({ 
        mood_level: moodLevel, 
        mood_name: moodName, 
        note 
      }),
    });
  }

  /** 
   * ⭐ 取得今日心情
   * @returns {Promise<{mood: Object}>}
   */
  async getTodayMood() {
    return this.request('/mood/today.php', {
      method: 'GET',
    });
  }

  /** 
   * 取得心情歷史
   * @param {string} startDate - 開始日期（YYYY-MM-DD）
   * @param {string} endDate - 結束日期（YYYY-MM-DD）
   */
  async getMoodHistory(startDate, endDate) {
    return this.request(`/mood/history.php?start=${startDate}&end=${endDate}`, {
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

  // ==========================================
  // 🔄 舊版 API 相容性（向後兼容）
  // ==========================================

  /** 
   * @deprecated 請改用 completePractice(practiceId, data)
   * 舊版完成練習方法（使用 practiceType）
   */
  async completePracticeWithData(practiceType, duration, formData) {
    console.warn('⚠️ completePracticeWithData 已棄用，建議使用 completePractice');
    return this.request('/practice/complete.php', {
      method: 'POST',
      body: JSON.stringify({ 
        practiceType, 
        duration,
        feeling: formData.feeling,
        noticed: formData.noticed,
        reflection: formData.reflection
      }),
    });
  }

  /** 
   * @deprecated 請改用 updatePracticeProgress(practiceId, ...)
   * 舊版儲存進度方法（使用 practiceType）
   */
  async savePracticeProgress(practiceType, currentPage, totalPages, formData) {
    console.warn('⚠️ savePracticeProgress 已棄用，建議使用 updatePracticeProgress');
    return this.request('/practice/save-progress.php', {
      method: 'POST',
      body: JSON.stringify({ 
        practice_type: practiceType,
        current_page: currentPage,
        total_pages: totalPages,
        form_data: formData
      }),
    });
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

// ========== 新版練習流程 ==========

// 1. 開始練習
const startResponse = await ApiService.startPractice('呼吸穩定力練習');
const practiceId = startResponse.practiceId;

// 2. 更新進度（可選，中途保存）
await ApiService.updatePracticeProgress(
  practiceId, 
  5,  // 當前頁面
  10, // 總頁數
  { feeling: '很放鬆', noticed: '呼吸變慢了' }
);

// 3. 完成練習
await ApiService.completePractice(practiceId, {
  duration: 8, // 實際投入 8 分鐘
  feeling: '很放鬆',
  noticed: '呼吸變慢了',
  reflection: '今天練習很順利',
  emotionData: { // 情緒理解力練習才需要
    moment: '下午',
    whatHappened: '工作壓力大',
    selectedEmotions: ['焦慮', '疲憊'],
    // ...其他情緒日記欄位
  }
});

// ========== 密碼重設流程 ==========

// 1. 驗證重設令牌
try {
  const result = await ApiService.validateResetToken('your-token-here');
  if (result.valid) {
    console.log('令牌有效，可以重設密碼');
  }
} catch (error) {
  console.error('令牌無效或已過期');
}

// 2. 重設密碼
try {
  await ApiService.resetPassword('your-token-here', 'new-password-123');
  console.log('密碼重設成功');
} catch (error) {
  console.error('密碼重設失敗:', error.message);
}

// ========== 其他功能 ==========

// 獲取練習歷史
const history = await ApiService.getPracticeHistory();
console.log('練習記錄:', history.practices);

// 獲取今日心情
const todayMood = await ApiService.getTodayMood();
console.log('今日心情:', todayMood.mood);

// 記錄心情
await ApiService.recordMood(5, '超讚!', '今天心情很好');

// 獲取今日練習狀態
const status = await ApiService.getTodayPracticeStatus();
console.log('今日練習狀態:', status.practices);
*/