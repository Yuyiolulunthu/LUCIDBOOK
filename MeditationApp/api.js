// src/services/api.js
// ⚠️ 此檔案保留以確保向後兼容
// 新代碼請使用 src/services/api/ 資料夾中的服務

import ApiService from './src/services/index';



export default ApiService;

/*
 * 使用範例：
 * 
 * 舊寫法（仍然可用）：
 * import ApiService from './services/api';
 * await ApiService.login(email, password);
 * 
 * 新寫法（推薦）：
 * import { authService } from './services/api';
 * await authService.login(email, password);
 * 
 * 或者分別導入：
 * import { authService, practiceService, moodService } from './services/api';
 */