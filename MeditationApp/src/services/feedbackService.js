// src/services/api/feedbackService.js
// 意見回饋服務

import apiClient from './client';

const feedbackService = {
  /**
   * 提交意見回饋
   * @param {Object} feedbackData - 回饋資料
   * @param {string} feedbackData.type - 回饋類型: 'feature' | 'bug' | 'praise' | 'other'
   * @param {string} feedbackData.description - 詳細描述
   * @param {string} feedbackData.contactInfo - 聯絡信箱 (選填)
   * @param {Array<string>} feedbackData.images - 圖片 URI 陣列 (選填)
   * @param {string} feedbackData.timestamp - 時間戳記
   * @param {string} feedbackData.platform - 平台: 'ios' | 'android'
   */
  async submitFeedback(feedbackData) {
    try {
      console.log('📤 準備提交回饋:', feedbackData.type);

      // 創建 FormData
      const formData = new FormData();

      // 基本資料
      formData.append('type', feedbackData.type);
      formData.append('description', feedbackData.description);
      formData.append('timestamp', feedbackData.timestamp);
      formData.append('platform', feedbackData.platform);

      // 選填：聯絡信箱
      if (feedbackData.contactInfo) {
        formData.append('contactInfo', feedbackData.contactInfo);
      }

      // 處理圖片上傳
      if (feedbackData.images && feedbackData.images.length > 0) {
        console.log(`📷 準備上傳 ${feedbackData.images.length} 張圖片`);
        
        feedbackData.images.forEach((imageUri, index) => {
          // 取得檔名和副檔名
          const filename = imageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          // 加入 FormData
          formData.append('images', {
            uri: imageUri,
            name: filename || `feedback_image_${index}.jpg`,
            type: type,
          });
        });
      }

      // 發送請求
      const response = await apiClient.request('/feedback/submit.php', {
        method: 'POST',
        body: formData,
        headers: {
          // 注意：使用 FormData 時不要手動設置 Content-Type
          // React Native 會自動處理
        },
      });

      console.log('✅ 回饋提交成功:', response);
      return response;

    } catch (error) {
      console.error('❌ 提交回饋失敗:', error);
      throw error;
    }
  },

  /**
   * 取得用戶的回饋歷史
   * @returns {Promise<Object>} 回饋歷史列表
   */
  async getFeedbackHistory() {
    try {
      return await apiClient.request('/feedback/history.php', {
        method: 'GET',
      });
    } catch (error) {
      console.error('❌ 取得回饋歷史失敗:', error);
      throw error;
    }
  },

  /**
   * 取得單一回饋的詳細資訊
   * @param {string} feedbackId - 回饋 ID
   * @returns {Promise<Object>} 回饋詳細資訊
   */
  async getFeedbackDetail(feedbackId) {
    try {
      return await apiClient.request(`/feedback/detail.php?id=${feedbackId}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('❌ 取得回饋詳情失敗:', error);
      throw error;
    }
  },
};

export default feedbackService;