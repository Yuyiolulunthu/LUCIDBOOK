// src/services/api/index.js
// 統一匯出所有服務，方便導入使用

export { default as apiClient } from './client';
export { default as authService } from './authService';
export { default as userProfile } from './userProfile';
export { default as practiceService } from './practiceService';
export { default as moodService } from './moodService';
export { default as emotionDiaryService } from './emotionDiaryService';

// 預設匯出 - 包含所有服務的物件（向後兼容）
import authService from './authService';
import userProfile from './userProfile';
import practiceService from './practiceService';
import moodService from './moodService';
import emotionDiaryService from './emotionDiaryService';
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

  // 練習統計服務
  getPracticeStats: async () => {
    return apiClient.request('/practice/stats.php', {
      method: 'GET',
    });
  },
  
  // 成就徽章服務
  getAchievements: async () => {
    return apiClient.request('/practice/achievements.php', {
      method: 'GET',
    });
  },

  // 企業引薦碼驗證
  async verifyEnterpriseCode(code) {
    console.log('驗證代碼:', code);
    
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 測試代碼
    const validCodes = {
      'ABC123': {
        enterpriseId: 'ent_001',
        enterpriseName: '測試企業有限公司',
        features: ['enterprise_practices', 'advanced_reports', 'team_statistics']
      },
      'TEST01': {
        enterpriseId: 'ent_002',
        enterpriseName: 'NTHU 國立清華大學',
        features: ['enterprise_practices', 'custom_content']
      },
      '00AA99': {
        enterpriseId: 'ent_003',
        enterpriseName: '範例科技公司',
        features: ['enterprise_practices', 'priority_support']
      }
    };

    const upperCode = code.toUpperCase();

    if (validCodes[upperCode]) {
      return {
        success: true,
        enterprise: {
          id: validCodes[upperCode].enterpriseId,
          name: validCodes[upperCode].enterpriseName,
          features: validCodes[upperCode].features
        },
        message: '驗證成功'
      };
    }

    return {
      success: false,
      enterprise: null,
      message: '引薦碼無效或已過期'
    };
  }
};

export default ApiService;