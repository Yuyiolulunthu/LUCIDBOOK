// ==========================================
// 檔案名稱: utils/practiceTypeMapping.js
// 功能: 練習類型映射工具 - 處理中英文練習名稱對應
// ==========================================

/**
 * 練習類型映射表
 * 將前端使用的英文代碼映射到可能的後端名稱
 */
export const PRACTICE_TYPE_MAP = {
  // 呼吸練習的各種可能名稱
  breathing: {
    code: 'breathing',
    displayName: '呼吸練習',
    keywords: ['breathing', '呼吸', '呼吸穩定力', '呼吸覺察'],
    backendNames: ['breathing', '呼吸穩定力練習', '呼吸練習', '呼吸覺察練習'],
  },
  
  // 好事書寫的各種可能名稱
  goodthings: {
    code: 'goodthings',
    displayName: '好事書寫',
    keywords: ['goodthings', 'good', '好事', '書寫', '感恩'],
    backendNames: ['goodthings', '好事書寫', '感恩日記', '正向書寫'],
  },
  
  // 情緒理解力練習
  emotion: {
    code: 'emotion',
    displayName: '情緒理解力',
    keywords: ['emotion', '情緒', '理解', '覺察'],
    backendNames: ['emotion', '情緒理解力練習', '情緒覺察', '情緒日記'],
  },
  
  // 自我覺察力練習
  awareness: {
    code: 'awareness',
    displayName: '自我覺察力',
    keywords: ['awareness', '自我', '覺察', '反思'],
    backendNames: ['awareness', '自我覺察力練習', '覺察練習'],
  },
};

/**
 * 根據後端練習名稱找到對應的前端代碼
 * @param {string} backendName - 後端返回的練習名稱
 * @returns {string} 前端使用的練習代碼，找不到則返回原名稱
 */
export const mapBackendToFrontend = (backendName) => {
  if (!backendName) return null;
  
  const lowerName = backendName.toLowerCase().trim();
  
  // 遍歷所有練習類型
  for (const [code, config] of Object.entries(PRACTICE_TYPE_MAP)) {
    // 檢查是否匹配任何關鍵字
    const matched = config.keywords.some(keyword => 
      lowerName.includes(keyword.toLowerCase())
    );
    
    if (matched) {
      return code;
    }
  }
  
  // 找不到匹配則返回原名稱
  return backendName;
};

/**
 * 根據前端代碼獲取用於後端請求的名稱
 * @param {string} frontendCode - 前端使用的練習代碼
 * @returns {string} 後端期望的練習名稱
 */
export const mapFrontendToBackend = (frontendCode) => {
  const config = PRACTICE_TYPE_MAP[frontendCode];
  if (!config) return frontendCode;
  
  // 返回第一個後端名稱作為默認值
  return config.backendNames[0];
};

/**
 * 檢查練習記錄是否屬於指定類型
 * @param {object} practice - 練習記錄對象
 * @param {string} targetType - 目標練習類型（前端代碼）
 * @returns {boolean} 是否匹配
 */
export const isPracticeType = (practice, targetType) => {
  if (!practice || !practice.practice_type) return false;
  
  const backendType = practice.practice_type.toLowerCase();
  const config = PRACTICE_TYPE_MAP[targetType];
  
  if (!config) return false;
  
  // 檢查是否匹配任何關鍵字
  return config.keywords.some(keyword => 
    backendType.includes(keyword.toLowerCase())
  );
};

/**
 * 過濾練習記錄列表，只保留指定類型
 * @param {array} practices - 練習記錄數組
 * @param {string} targetType - 目標練習類型（前端代碼）
 * @returns {array} 過濾後的練習記錄
 */
export const filterPracticesByType = (practices, targetType) => {
  if (!practices || !Array.isArray(practices)) return [];
  
  return practices.filter(practice => 
    isPracticeType(practice, targetType)
  );
};

/**
 * 計算指定類型練習的週進度
 * @param {array} weeklyPractices - 本週練習記錄
 * @param {string} practiceType - 練習類型（前端代碼）
 * @returns {array} 長度為 7 的 boolean 數組，表示 [日,一,二,三,四,五,六] 是否完成
 */
export const computeWeeklyCheckIns = (weeklyPractices, practiceType) => {
  const result = Array(7).fill(false);
  
  if (!weeklyPractices || !Array.isArray(weeklyPractices)) {
    return result;
  }
  
  weeklyPractices.forEach((item) => {
    // 檢查是否是目標練習類型
    if (!isPracticeType(item, practiceType)) {
      return;
    }
    
    // 從 created_at 或 completed_at 取得日期
    const dateStr = item.created_at || item.completed_at;
    if (!dateStr) return;
    
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;
    
    // JS 的 getDay(): 0=日, 1=一, ... 6=六
    const dayIndex = d.getDay();
    result[dayIndex] = true;
  });
  
  return result;
};

/**
 * 計算指定類型練習的月累計天數
 * @param {array} monthlyPractices - 本月練習記錄
 * @param {string} practiceType - 練習類型（前端代碼）
 * @returns {number} 本月完成的天數
 */
export const computeMonthlyTotal = (monthlyPractices, practiceType) => {
  if (!monthlyPractices || !Array.isArray(monthlyPractices)) {
    return 0;
  }
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  
  const daysSet = new Set();
  
  monthlyPractices.forEach((item) => {
    // 檢查是否是目標練習類型
    if (!isPracticeType(item, practiceType)) {
      return;
    }
    
    const dateStr = item.created_at || item.completed_at;
    if (!dateStr) return;
    
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;
    
    // 檢查是否是本月
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      daysSet.add(key);
    }
  });
  
  return daysSet.size;
};

/**
 * 獲取練習類型的顯示名稱
 * @param {string} code - 練習代碼
 * @returns {string} 顯示名稱
 */
export const getPracticeDisplayName = (code) => {
  const config = PRACTICE_TYPE_MAP[code];
  return config ? config.displayName : code;
};

/**
 * 獲取所有可用的練習類型
 * @returns {array} 練習類型數組
 */
export const getAllPracticeTypes = () => {
  return Object.keys(PRACTICE_TYPE_MAP).map(code => ({
    code,
    displayName: PRACTICE_TYPE_MAP[code].displayName,
  }));
};

// 使用示例：
// 
// 1. 在 HomeScreen.js 中：
// import { 
//   computeWeeklyCheckIns, 
//   computeMonthlyTotal,
//   mapBackendToFrontend 
// } from './utils/practiceTypeMapping';
//
// const weeklyCheckIns = computeWeeklyCheckIns(
//   stats.weeklyPractices, 
//   'breathing'
// );
//
// 2. 處理後端返回的練習記錄：
// const frontendType = mapBackendToFrontend(practice.practice_type);
// // "呼吸穩定力練習" -> "breathing"
//
// 3. 發送請求到後端：
// const backendName = mapFrontendToBackend('breathing');
// // "breathing" -> "breathing" (或 "呼吸穩定力練習"，取決於你的配置)