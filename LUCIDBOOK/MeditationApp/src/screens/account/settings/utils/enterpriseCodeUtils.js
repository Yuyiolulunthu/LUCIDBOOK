// ==========================================
// 檔案名稱: enterpriseCodeUtils.js
// 功能: 企業引薦碼相關工具函數
// 
// ✅ 效期檢查
// ✅ 代碼驗證
// ✅ 自動清理過期代碼
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * 檢查企業引薦碼是否有效
 * @returns {Promise<{isValid: boolean, code: string|null, enterpriseName: string|null, expiryDate: Date|null}>}
 */
export const checkEnterpriseCodeValidity = async () => {
  try {
    const [code, expiryStr, enterpriseName] = await AsyncStorage.multiGet([
      'enterpriseCode',
      'enterpriseCodeExpiry',
      'enterpriseName'
    ]);

    const enterpriseCode = code[1];
    const expiryDate = expiryStr[1] ? new Date(expiryStr[1]) : null;
    const name = enterpriseName[1];

    // 如果沒有代碼，返回無效
    if (!enterpriseCode || !expiryDate) {
      return {
        isValid: false,
        code: null,
        enterpriseName: null,
        expiryDate: null
      };
    }

    // 檢查是否過期
    const now = new Date();
    const isValid = expiryDate > now;

    // 如果過期，自動清理
    if (!isValid) {
      await clearEnterpriseCode();
      return {
        isValid: false,
        code: null,
        enterpriseName: null,
        expiryDate: null
      };
    }

    return {
      isValid: true,
      code: enterpriseCode,
      enterpriseName: name,
      expiryDate: expiryDate
    };
  } catch (error) {
    console.error('檢查企業引薦碼失敗:', error);
    return {
      isValid: false,
      code: null,
      enterpriseName: null,
      expiryDate: null
    };
  }
};

/**
 * 獲取企業引薦碼資訊
 * @returns {Promise<{code: string|null, enterpriseName: string|null, expiryDate: Date|null, daysRemaining: number|null}>}
 */
export const getEnterpriseCodeInfo = async () => {
  const validity = await checkEnterpriseCodeValidity();
  
  if (!validity.isValid) {
    return {
      code: null,
      enterpriseName: null,
      expiryDate: null,
      daysRemaining: null
    };
  }

  // 計算剩餘天數
  const now = new Date();
  const diffTime = validity.expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    code: validity.code,
    enterpriseName: validity.enterpriseName,
    expiryDate: validity.expiryDate,
    daysRemaining: daysRemaining
  };
};

/**
 * 清理企業引薦碼（過期或手動刪除時使用）
 */
export const clearEnterpriseCode = async () => {
  try {
    await AsyncStorage.multiRemove([
      'enterpriseCode',
      'enterpriseCodeExpiry',
      'enterpriseName',
      'enterpriseId'
    ]);
    return true;
  } catch (error) {
    console.error('清理企業引薦碼失敗:', error);
    return false;
  }
};

/**
 * 檢查並提示用戶企業引薦碼即將過期
 * @param {number} daysThreshold - 提前幾天提醒（預設7天）
 */
export const checkAndNotifyExpiry = async (daysThreshold = 7) => {
  const info = await getEnterpriseCodeInfo();
  
  if (info.daysRemaining !== null && info.daysRemaining <= daysThreshold) {
    Alert.alert(
      '企業引薦碼即將過期',
      `您的企業引薦碼將在 ${info.daysRemaining} 天後過期，屆時將無法存取專屬內容。\n\n請聯繫您的企業管理員以獲取新的引薦碼。`,
      [{ text: '知道了' }]
    );
  }
};

/**
 * 格式化效期日期顯示
 * @param {Date} date - 效期日期
 * @returns {string} 格式化後的日期字串
 */
export const formatExpiryDate = (date) => {
  if (!date) return '';
  
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * 檢查是否需要企業引薦碼才能存取特定功能
 * @param {string} featureId - 功能ID
 * @returns {Promise<boolean>}
 */
export const requiresEnterpriseCode = async (featureId) => {
  // 這裡可以根據功能ID判斷是否需要企業引薦碼
  // 例如：企業專屬練習模組、進階報告等
  const enterpriseFeatures = [
    'enterprise_practices',
    'advanced_reports',
    'team_statistics',
    'custom_content'
  ];
  
  if (enterpriseFeatures.includes(featureId)) {
    const validity = await checkEnterpriseCodeValidity();
    return !validity.isValid;
  }
  
  return false;
};

/**
 * 獲取企業專屬功能列表
 * @returns {Promise<Array>}
 */
export const getEnterpriseFeatures = async () => {
  const validity = await checkEnterpriseCodeValidity();
  
  if (!validity.isValid) {
    return [];
  }

  // 返回企業專屬功能列表
  return [
    {
      id: 'enterprise_practices',
      name: '免費進階功能存取',
      icon: 'star',
      enabled: true
    },
    {
      id: 'custom_content',
      name: '專屬企業練習課程',
      icon: 'book',
      enabled: true
    },
    {
      id: 'advanced_reports',
      name: '團隊統計報告',
      icon: 'analytics',
      enabled: true
    },
    {
      id: 'priority_support',
      name: '優先客服支援',
      icon: 'headset',
      enabled: true
    }
  ];
};

export default {
  checkEnterpriseCodeValidity,
  getEnterpriseCodeInfo,
  clearEnterpriseCode,
  checkAndNotifyExpiry,
  formatExpiryDate,
  requiresEnterpriseCode,
  getEnterpriseFeatures
};