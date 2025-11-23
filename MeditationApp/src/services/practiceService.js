// src/services/api/practiceService.js
import apiClient from './client';

class PracticeService {
  /** 
   * 開始練習 - 創建或恢復練習記錄
   */
  async startPractice(practiceType) {
    return apiClient.request('/practice/start.php', {
      method: 'POST',
      body: JSON.stringify({ 
        practice_type: practiceType 
      }),
    });
  }

  /**
   * 完成練習 - 記錄實際投入時間
   */
  async completePractice(practiceId, data) {
    return apiClient.request('/practice/complete.php', {
      method: 'POST',
      body: JSON.stringify({
        practice_id: practiceId,
        duration_seconds: data.duration_seconds || 0,
        duration: data.duration,
        feeling: data.feeling || null,
        noticed: data.noticed || null,
        reflection: data.reflection || null,
        emotion_data: data.emotion_data || null,
        thought: data.thought || null,
        thoughtOrigin: data.thoughtOrigin || null,
        thoughtValidity: data.thoughtValidity || null,
        thoughtImpact: data.thoughtImpact || null,
        responseMethod: data.responseMethod || null,
        newResponse: data.newResponse || null,
      }),
    });
  }

  /**
   * 更新練習進度（中途保存）
   */
  async updatePracticeProgress(practiceId, currentPage, totalPages, formData, accumulatedSeconds = null) {
    const requestBody = {
      practice_id: practiceId,
      current_page: currentPage,
      total_pages: totalPages,
      form_data: formData,
    };
    
    if (accumulatedSeconds !== null && accumulatedSeconds !== undefined) {
      requestBody.accumulated_seconds = accumulatedSeconds;
    }
    
    return apiClient.request('/practice/update-progress.php', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /** 
   * 取得練習歷史
   */
  async getPracticeHistory() {
    return apiClient.request('/practice/history.php', {
      method: 'GET',
    });
  }

  /** 
   * 取得今日練習狀態
   */
  async getTodayPracticeStatus() {
    return apiClient.request('/practice/today-status.php', {
      method: 'GET',
    });
  }

  // ==========================================
  // 🔄 向後兼容的舊版方法
  // ==========================================

  /** @deprecated 請改用 completePractice */
  async completePracticeWithData(practiceType, duration, formData) {
    console.warn('⚠️ completePracticeWithData 已棄用，建議使用 completePractice');
    return apiClient.request('/practice/complete.php', {
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

  /** @deprecated 請改用 updatePracticeProgress */
  async savePracticeProgress(practiceType, currentPage, totalPages, formData) {
    console.warn('⚠️ savePracticeProgress 已棄用，建議使用 updatePracticeProgress');
    return apiClient.request('/practice/save-progress.php', {
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

const practiceService = new PracticeService();
export default practiceService;