// ==========================================
// 檔案名稱: hooks/useAuth.js
// 🔒 登入狀態管理 Hook（使用 ApiService）
// ==========================================

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import ApiService from '../../services/api';

/**
 * 🔒 自定義 Hook：檢查用戶登入狀態
 * 使用 ApiService 進行身份驗證
 * 
 * @param {object} navigation - React Navigation 的 navigation 物件
 * @returns {object} - { isLoggedIn, user, loading, requireLogin, checkLoginStatus }
 * 
 * @example
 * const { isLoggedIn, requireLogin } = useAuth(navigation);
 * 
 * const handleStart = () => {
 *   if (!requireLogin('請先登入以開始練習')) return;
 *   // 繼續執行...
 * };
 */
export const useAuth = (navigation) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 檢查登入狀態
   * 使用 ApiService.isLoggedIn() 和 ApiService.getUserProfile()
   */
  const checkLoginStatus = async () => {
    try {
      setLoading(true);
      
      // 使用 ApiService 檢查是否有 token
      const loggedIn = await ApiService.isLoggedIn();
      
      if (loggedIn) {
        try {
          // 嘗試獲取用戶資料
          const response = await ApiService.getUserProfile();
          setUser({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
          });
          setIsLoggedIn(true);
        } catch (error) {
          // Token 可能已過期或無效
          console.log('Token 無效或已過期');
          await ApiService.clearToken();
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('檢查登入狀態失敗:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // 初始載入
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 監聽頁面焦點
  useEffect(() => {
    if (!navigation) return;

    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
    });

    return unsubscribe;
  }, [navigation]);

  /**
   * 要求用戶登入
   * 
   * @param {string} message - 提示訊息
   * @param {function} onCancel - 取消時的回調函數
   * @returns {boolean} - 是否已登入
   * 
   * @example
   * if (!requireLogin('請先登入以開始練習')) return;
   */
  const requireLogin = (message = '請先登入以使用此功能', onCancel = null) => {
    if (isLoggedIn) {
      return true;
    }

    Alert.alert(
      '需要登入',
      message,
      [
        {
          text: '取消',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: '立即登入',
          onPress: () => {
            if (navigation) {
              navigation.navigate('Profile');
            }
          },
        },
      ]
    );

    return false;
  };

  /**
   * 登出函數
   * 清除 token 並重置狀態
   */
  const logout = async () => {
    try {
      await ApiService.logout();
      setUser(null);
      setIsLoggedIn(false);
      return true;
    } catch (error) {
      console.error('登出失敗:', error);
      return false;
    }
  };

  return {
    isLoggedIn,
    user,
    loading,
    requireLogin,
    checkLoginStatus,
    logout,
  };
};

export default useAuth;