// src/services/api/authService.js
import apiClient from './client';

class AuthService {
  /** 註冊新用戶 */
  async register(name, email, password) {
    return apiClient.request('/register.php', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  /** 登入 */
  async login(email, password) {
    const data = await apiClient.request('/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      await apiClient.saveToken(data.token);
    }

    return data;
  }

  /** 登出 */
  async logout() {
    await apiClient.clearToken();
    console.log('👋 已登出');
  }

  /** 忘記密碼 - 發送重設郵件 */
  async forgotPassword(email) {
    return apiClient.request('/forgot-password.php', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /** 驗證重設密碼令牌 */
  async validateResetToken(token) {
    return apiClient.request('/validate-reset-token.php', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /** 重設密碼 (忘記密碼流程) */
  async resetPassword(token, newPassword) {
    return apiClient.request('/reset-password.php', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  /** 修改密碼 (從設定頁面) */
  async changePassword(currentPassword, newPassword) {
    return apiClient.request('/change-password.php', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  /** ⭐ 刪除帳號 */
  async deleteAccount() {
    console.log('🗑️ [AuthService] 開始刪除帳號');
    
    try {
      const response = await apiClient.request('/user/delete-account.php', {
        method: 'DELETE',
      });
      
      if (response.success) {
        console.log('✅ [AuthService] 帳號刪除成功');
        // 清除本地 token
        await apiClient.clearToken();
        return response;
      } else {
        console.error('❌ [AuthService] 刪除失敗:', response.message);
        throw new Error(response.message || '刪除帳號失敗');
      }
    } catch (error) {
      console.error('❌ [AuthService] 刪除帳號失敗:', error);
      throw error;
    }
  }

  /** 檢查是否已登入 */
  async isLoggedIn() {
    return apiClient.isLoggedIn();
  }
}

const authService = new AuthService();
export default authService;