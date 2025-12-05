// src/services/api/index.js
// 統一匯出所有服務,方便導入使用

export { default as apiClient } from './client';
export { default as authService } from './authService';
export { default as userProfile } from './userProfile';
export { default as practiceService } from './practiceService';
export { default as moodService } from './moodService';
export { default as emotionDiaryService } from './emotionDiaryService';
export { default as feedbackService } from './feedbackService';

// 預設匯出 - 包含所有服務的物件（向後兼容）
import authService from './authService';
import userProfile from './userProfile';
import practiceService from './practiceService';
import moodService from './moodService';
import emotionDiaryService from './emotionDiaryService';
import feedbackService from './feedbackService';
import apiClient from './client';

const ApiService = {
  // Token 管理
  getToken: () => apiClient.getToken(),
  saveToken: (token) => apiClient.saveToken(token),
  clearToken: () => apiClient.clearToken(),
  isLoggedIn: () => apiClient.isLoggedIn(),
  testConnection: () => apiClient.testConnection(),
  
  // 認證服務
  register: (name, email, password) => authService.register(name, email, password),
  login: (email, password) => authService.login(email, password),
  logout: () => authService.logout(),
  forgotPassword: (email) => authService.forgotPassword(email),
  validateResetToken: (token) => authService.validateResetToken(token),
  resetPassword: (token, newPassword) => authService.resetPassword(token, newPassword),
  changePassword: (currentPassword, newPassword) => authService.changePassword(currentPassword, newPassword),
  deleteAccount: () => authService.deleteAccount(), // ⭐ 新增刪除帳號
  
  // 用戶服務
  getUserProfile: () => userProfile.getUserProfile(),
  updateUserProfile: (data) => userProfile.updateUserProfile(data),
  uploadAvatar: (imageUri) => userProfile.uploadAvatar(imageUri),
  updateProfileWithAvatar: (profileData, avatarUri) => userProfile.updateProfileWithAvatar(profileData, avatarUri),
  
  // 練習服務
  startPractice: (practiceType) => practiceService.startPractice(practiceType),
  completePractice: (practiceId, data) => practiceService.completePractice(practiceId, data),
  updatePracticeProgress: (practiceId, currentPage, totalPages, formData, accumulatedSeconds) => 
    practiceService.updatePracticeProgress(practiceId, currentPage, totalPages, formData, accumulatedSeconds),
  getPracticeHistory: () => practiceService.getPracticeHistory(),
  getTodayPracticeStatus: () => practiceService.getTodayPracticeStatus(),
  completePracticeWithData: (practiceType, duration, formData) => 
    practiceService.completePracticeWithData(practiceType, duration, formData),
  savePracticeProgress: (practiceType, currentPage, totalPages, formData) => 
    practiceService.savePracticeProgress(practiceType, currentPage, totalPages, formData),
  
  // 心情服務
  recordMood: (moodLevel, moodName, note) => moodService.recordMood(moodLevel, moodName, note),
  getTodayMood: () => moodService.getTodayMood(),
  getMoodHistory: (startDate, endDate) => moodService.getMoodHistory(startDate, endDate),
  
  // 情緒日記服務
  saveEmotionDiary: (diaryData) => emotionDiaryService.saveEmotionDiary(diaryData),
  getTodayEmotionDiary: () => emotionDiaryService.getTodayEmotionDiary(),
  
  // 情緒日記月度統計
  getEmotionDiaryMonthly: async (year, month) => {
    try {
      console.log('📊 [API] 獲取情緒日記月度統計:', { year, month });
      
      const response = await apiClient.request(
        `/emotion-diary/monthly.php?year=${year}&month=${month}`, 
        { method: 'GET' }
      );
      
      if (response.success) {
        console.log('✅ [API] 情緒日記月度統計載入成功:', 
          response.diaries?.length || 0, '筆記錄');
        return response;
      } else {
        console.warn('⚠️ [API] 情緒日記月度統計無數據');
        return { success: false, diaries: [] };
      }
    } catch (error) {
      console.error('❌ [API] 獲取情緒日記月度統計失敗:', error);
      return { success: false, diaries: [], error: error.message };
    }
  },

  // 練習統計服務
  getPracticeStats: async () => {
    return apiClient.request('/practice/stats.php', {
      method: 'GET',
    });
  },

  // 情緒統計服務
  getEmotionStats: async (year, month) => {
    return apiClient.request(`/practice/emotion-stats.php?year=${year}&month=${month}`, {
      method: 'GET',
    });
  },
  
  // 成就徽章服務
  getAchievements: async () => {
    return apiClient.request('/practice/achievements.php', {
      method: 'GET',
    });
  },

  // 意見回饋服務
  submitFeedback: (feedbackData) => feedbackService.submitFeedback(feedbackData),
  getFeedbackHistory: () => feedbackService.getFeedbackHistory(),
  getFeedbackDetail: (feedbackId) => feedbackService.getFeedbackDetail(feedbackId),

  // 訓練計劃進度追蹤服務
  async getTrainingProgress(planId) {
    try {
      console.log('🔄 [API] 獲取訓練進度:', planId);
      
      const response = await apiClient.request(`/training/progress.php?plan_id=${planId}`, {
        method: 'GET',
      });
      
      if (response.success) {
        console.log('✅ [API] 訓練進度載入成功');
        return response;
      } else {
        throw new Error(response.error || '獲取訓練進度失敗');
      }
    } catch (error) {
      console.error('❌ [API] 獲取訓練進度失敗:', error);
      throw error;
    }
  },

  async updateTrainingProgress(planId, weekNumber, sessionId) {
    try {
      console.log('🔄 [API] 更新練習進度:', { planId, weekNumber, sessionId });
      
      const response = await apiClient.request('/training/progress.php', {
        method: 'POST',
        body: {
          plan_id: planId,
          week_number: weekNumber,
          session_id: sessionId,
        },
      });
      
      if (response.success) {
        console.log('✅ [API] 練習進度更新成功:', response.completed_count);
        return response;
      } else {
        throw new Error(response.error || '更新練習進度失敗');
      }
    } catch (error) {
      console.error('❌ [API] 更新練習進度失敗:', error);
      throw error;
    }
  },

  // 企業引薦碼驗證服務
  async verifyEnterpriseCode(code) {
    try {
      console.log('🔐 [API] 驗證企業引薦碼:', code);
      
      const response = await apiClient.request('/enterprise/verify.php', {
        method: 'POST',
        body: { code },
      });
      
      if (response.success) {
        console.log('✅ [API] 企業引薦碼驗證成功:', response.enterprise?.name);
        console.log('📋 [API] 企業資訊:', {
          id: response.enterprise?.id,
          name: response.enterprise?.name,
          subscriptionEndDate: response.enterprise?.subscriptionEndDate,
          features: response.enterprise?.features
        });
        return response;
      } else {
        console.error('❌ [API] 企業引薦碼無效:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ [API] 驗證企業引薦碼失敗:', error);
      return {
        success: false,
        enterprise: null,
        message: error.message || '網路錯誤，請稍後再試',
      };
    }
  },
  
  async clearEnterpriseCode() {
    try {
      console.log('🗑️ [API] 清除企業引薦碼');
      
      const response = await apiClient.request('/enterprise/clear.php', {
        method: 'POST',
      });
      
      if (response.success) {
        console.log('✅ [API] 企業引薦碼已清除');
        return response;
      } else {
        console.error('❌ [API] 清除失敗:', response.message);
        return response;
      }
    } catch (error) {
      console.error('❌ [API] 清除企業引薦碼失敗:', error);
      return {
        success: false,
        message: error.message || '網路錯誤，請稍後再試',
      };
    }
  },
};

export default ApiService;