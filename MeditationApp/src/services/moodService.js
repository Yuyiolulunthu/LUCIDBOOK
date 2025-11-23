// src/services/api/moodService.js
import apiClient from './client';

class MoodService {
  /** 
   * 記錄今日心情
   */
  async recordMood(moodLevel, moodName, note = '') {
    return apiClient.request('/mood/record.php', {
      method: 'POST',
      body: JSON.stringify({ 
        mood_level: moodLevel, 
        mood_name: moodName, 
        note 
      }),
    });
  }

  /** 
   * 取得今日心情
   */
  async getTodayMood() {
    return apiClient.request('/mood/today.php', {
      method: 'GET',
    });
  }

  /** 
   * 取得心情歷史
   */
  async getMoodHistory(startDate, endDate) {
    return apiClient.request(`/mood/history.php?start=${startDate}&end=${endDate}`, {
      method: 'GET',
    });
  }
}

const moodService = new MoodService();
export default moodService;