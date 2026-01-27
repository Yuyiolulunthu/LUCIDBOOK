// src/services/api/userProfile.js
// V2.0 - 加入防快取機制
import apiClient from './client';

class UserProfile {
  /** 
   * 取得用戶資料 
   * @param {Object} options - 選項
   * @param {boolean} options.forceRefresh - 是否強制刷新（避免快取）
   */
  async getUserProfile(options = {}) {
    console.log('📱 [UserProfile] 獲取用戶資料', options.forceRefresh ? '(強制刷新)' : '');
    
    // ⭐ 建構 query string 避免快取
    const params = new URLSearchParams();
    if (options.forceRefresh || options._t) {
      params.append('_t', options._t || Date.now());
    }
    if (options._nocache) {
      params.append('_nocache', options._nocache);
    }
    
    const queryString = params.toString();
    const url = `/user/profile.php${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.request(url, {
      method: 'GET',
      // ⭐ 加入防快取 headers
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  }

  /** 更新用戶資料 */
  async updateUserProfile(data) {
    console.log('📱 [UserProfile] 更新用戶資料:', data);
    return apiClient.request('/user/profile.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /** 上傳頭像 */
  async uploadAvatar(imageUri) {
    console.log('📱 [UserProfile] 上傳頭像:', imageUri);
    
    try {
      // 準備 FormData
      const formData = new FormData();
      
      // 從 URI 取得檔案資訊
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('avatar', {
        uri: imageUri,
        name: filename || 'avatar.jpg',
        type: type,
      });

      // 獲取 token
      const token = await apiClient.getToken();
      
      // 使用 fetch 直接上傳（因為 FormData 需要特殊處理）
      const response = await fetch(`https://curiouscreate.com/api/user/avatar.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 不要設置 Content-Type，讓瀏覽器自動設置 multipart/form-data
        },
        body: formData,
      });

      const text = await response.text();
      console.log('📥 [上傳頭像] 回應:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`伺服器回傳格式錯誤: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `上傳失敗: ${response.status}`);
      }

      console.log('✅ [上傳頭像] 成功:', data);
      return data;
    } catch (error) {
      console.error('❌ [上傳頭像] 失敗:', error);
      throw error;
    }
  }

  /** 更新用戶資料（包含頭像上傳）*/
  async updateProfileWithAvatar(profileData, avatarUri = null) {
    console.log('📱 [UserProfile] 更新完整資料');
    
    try {
      let avatarUrl = profileData.avatar;
      
      // 如果有新頭像，先上傳
      if (avatarUri) {
        console.log('🖼️ 偵測到新頭像，開始上傳...');
        const uploadResult = await this.uploadAvatar(avatarUri);
        avatarUrl = uploadResult.url || uploadResult.avatar_url;
        console.log('✅ 頭像上傳成功，URL:', avatarUrl);
      }
      
      // 更新用戶資料
      const updateData = {
        ...profileData,
        avatar: avatarUrl,
      };
      
      const result = await this.updateUserProfile(updateData);
      console.log('✅ 用戶資料更新成功');
      
      return result;
    } catch (error) {
      console.error('❌ 更新失敗:', error);
      throw error;
    }
  }
}

const userProfile = new UserProfile();
export default userProfile;