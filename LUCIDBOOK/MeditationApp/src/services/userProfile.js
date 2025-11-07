// src/services/api/userProfile.js
import apiClient from './client';

class UserProfile {
  /** 取得用戶資料 */
  async getUserProfile() {
    return apiClient.request('/user/profile.php', {
      method: 'GET',
    });
  }

  // 未來可擴展的方法：
  // async updateUserProfile(data) { ... }
  // async getuserProfile() { ... }
}

const userProfile = new UserProfile();
export default userProfile;