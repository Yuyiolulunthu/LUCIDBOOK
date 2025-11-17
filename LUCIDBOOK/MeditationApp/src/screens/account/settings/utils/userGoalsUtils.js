// ==========================================
// 檔案名稱: userGoalsUtils.js
// 功能: 用戶練習目標管理工具
// 
// ✅ 獲取用戶目標
// ✅ 保存用戶目標
// ✅ 獲取目標詳情
// ==========================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// 所有可用的目標選項
export const ALL_GOALS = [
  {
    id: 'stress',
    title: '減輕壓力',
    description: '透過正念練習釋放日常壓力',
    icon: 'cloud-outline',
    color: '#4A90E2',
    bgColor: '#E3F2FD',
  },
  {
    id: 'focus',
    title: '提升專注力',
    description: '增強注意力與工作效率',
    icon: 'bulb-outline',
    color: '#F59E0B',
    bgColor: '#FFF3E0',
  },
  {
    id: 'sleep',
    title: '改善睡眠',
    description: '建立健康的睡眠習慣',
    icon: 'moon-outline',
    color: '#8B5CF6',
    bgColor: '#F3E5F5',
  },
  {
    id: 'emotion',
    title: '情緒管理',
    description: '培養情緒覺察與調節能力',
    icon: 'heart-outline',
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
  {
    id: 'confidence',
    title: '建立自信',
    description: '提升自我價值感與信心',
    icon: 'trophy-outline',
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  {
    id: 'relationship',
    title: '改善人際關係',
    description: '增進同理心與溝通能力',
    icon: 'people-outline',
    color: '#06B6D4',
    bgColor: '#CFFAFE',
  },
  {
    id: 'mindfulness',
    title: '培養正念',
    description: '活在當下，提升生活品質',
    icon: 'flower-outline',
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
  {
    id: 'energy',
    title: '增加活力',
    description: '提升身心能量與動力',
    icon: 'flash-outline',
    color: '#F97316',
    bgColor: '#FFEDD5',
  },
];

/**
 * 獲取用戶已選擇的目標 ID 列表
 * @returns {Promise<string[]>} 目標 ID 陣列
 */
export const getUserGoals = async () => {
  try {
    const goalsJson = await AsyncStorage.getItem('userGoals');
    if (goalsJson) {
      return JSON.parse(goalsJson);
    }
    return [];
  } catch (error) {
    console.error('獲取用戶目標失敗:', error);
    return [];
  }
};

/**
 * 獲取用戶已選擇的目標詳細資訊
 * @returns {Promise<Object[]>} 目標詳情陣列
 */
export const getUserGoalsDetails = async () => {
  try {
    const goalIds = await getUserGoals();
    return ALL_GOALS.filter(goal => goalIds.includes(goal.id));
  } catch (error) {
    console.error('獲取用戶目標詳情失敗:', error);
    return [];
  }
};

/**
 * 保存用戶目標
 * @param {string[]} goalIds - 目標 ID 陣列
 * @returns {Promise<boolean>} 是否保存成功
 */
export const saveUserGoals = async (goalIds) => {
  try {
    await AsyncStorage.setItem('userGoals', JSON.stringify(goalIds));
    return true;
  } catch (error) {
    console.error('保存用戶目標失敗:', error);
    return false;
  }
};

/**
 * 檢查用戶是否已設置目標
 * @returns {Promise<boolean>}
 */
export const hasUserGoals = async () => {
  const goals = await getUserGoals();
  return goals.length > 0;
};

/**
 * 清除用戶目標
 * @returns {Promise<boolean>}
 */
export const clearUserGoals = async () => {
  try {
    await AsyncStorage.removeItem('userGoals');
    return true;
  } catch (error) {
    console.error('清除用戶目標失敗:', error);
    return false;
  }
};

/**
 * 根據 ID 獲取單個目標詳情
 * @param {string} goalId - 目標 ID
 * @returns {Object|null} 目標詳情或 null
 */
export const getGoalById = (goalId) => {
  return ALL_GOALS.find(goal => goal.id === goalId) || null;
};