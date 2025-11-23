// src/services/api/emotionDiaryService.js
import apiClient from './client';

class EmotionDiaryService {
  /** 
   * 儲存情緒日記
   */
  async saveEmotionDiary(diaryData) {
    return apiClient.request('/emotion-diary/save.php', {
      method: 'POST',
      body: JSON.stringify(diaryData),
    });
  }

  /** 
   * 取得今日情緒日記
   */
  async getTodayEmotionDiary() {
    return apiClient.request('/emotion-diary/today.php', {
      method: 'GET',
    });
  }
}

const emotionDiaryService = new EmotionDiaryService();
export default emotionDiaryService;