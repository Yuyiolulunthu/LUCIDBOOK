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
};

export default ApiService;