// ==========================================
// 檔案名稱: App.js 
// 應用主入口 - 只負責導航配置
// ==========================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 導入所有頁面
import HomeScreen from './src/screens/home/HomeScreen';
import EmotionalResiliencePlanScreen from './src/screens/home/EmotionalResiliencePlanScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import DailyScreen from './src/screens/diary/DailyScreen';
import AccountScreen from './src/screens/account/AccountScreen';

// 練習相關頁面
import PracticeSelectionScreen from './src/screens/practice/PracticeSelectionScreen';
import BreathingExerciseCard from './src/data/practices/BreathingExerciseCard';
import EmotionPractice from './src/data/practices/EmotionPractice';
import MindfulnessPractice from './src/data/practices/MindfulnessPractice';
import SelfAwarenessPractice from './src/data/practices/SelfAwarenessPractice';
import GoodThingsJournal from './src/data/practices/GoodThingsjournal';

// 訓練計畫相關頁面
import TrainingPlanDetailScreen from './src/screens/practice/training/TrainingPlanDetailScreen';
import TrainingPlanProgressScreen from './src/screens/practice/training/TrainingPlanProgressScreen';
import PracticeNavigator from './src/navigation/PracticeNavigator';

// 統計頁面
import PracticeStatsScreen from './src/screens/account/statistics/PracticeStatsScreen';

// 設定相關頁面
import Settings from './src/screens/account/settings/Settings';
import EnterpriseCode from './src/screens/account/settings/EnterpriseCode';
import Feedback from './src/screens/account/feedback/Feedback';
import Favorites from './src/screens/account/bookmarks/Favorites';
import SelectGoals from './src/screens/account/settings/SelectGoals';
import EnterpriseCodeManagement from './src/screens/account/settings/EnterpriseCodeManagement';

// 🆕 新增的設定工具頁面
import ProfileEditScreen from './src/screens/account/settings/utils/ProfileEditScreen';
import PrivacySettingsScreen from './src/screens/account/settings/utils/PrivacySettingsScreen';
import TermsOfServiceScreen from './src/screens/account/settings/utils/TermsOfServiceScreen';
import HelpCenter from './src/screens/account/settings/utils/HelpCenter';
import PrivacyPolicy from './src/screens/account/settings/utils/PrivacyPolicy';
import AboutUs from './src/screens/account/settings/utils/AboutUs';

const Stack = createNativeStackNavigator();

// ==========================================
// 主導航配置
// ==========================================
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* 主頁面 */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="EmotionalResiliencePlan" 
          component={EmotionalResiliencePlanScreen} 
          options={{ headerShown: false }}
        />
        
        {/* 認證相關頁面 */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        
        {/* 其他主要頁面 */}
        <Stack.Screen name="Daily" component={DailyScreen} />
        <Stack.Screen name="Profile" component={AccountScreen} />
        
        {/* 練習統計頁面 */}
        <Stack.Screen name="PracticeStats" component={PracticeStatsScreen} />
        
        {/* Explore 頁面 - 包含單個練習和訓練計畫 */}
        <Stack.Screen name="PracticeSelection" component={PracticeSelectionScreen} />
        
        {/* 單個練習頁面 */}
        <Stack.Screen name="BreathingPractice" component={BreathingExerciseCard} />
        <Stack.Screen name="EmotionPractice" component={EmotionPractice} />
        <Stack.Screen name="MindfulnessPractice" component={MindfulnessPractice} />
        <Stack.Screen name="SelfAwarenessPractice" component={SelfAwarenessPractice} />
        <Stack.Screen name="GoodThingsJournal" component={GoodThingsJournal} />
        
        {/* 訓練計畫相關頁面 */}
        <Stack.Screen name="TrainingPlanDetail" component={TrainingPlanDetailScreen} />
        <Stack.Screen name="TrainingPlanProgress" component={TrainingPlanProgressScreen} />
        <Stack.Screen name="PracticeNavigator" component={PracticeNavigator} />

        {/* 設定相關頁面 */}
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Feedback" component={Feedback} />
        <Stack.Screen name="Favorites" component={Favorites} />
        <Stack.Screen 
          name="EnterpriseCode" 
          component={EnterpriseCode}  
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EnterpriseCodeManagement" 
          component={EnterpriseCodeManagement}  
          options={{ headerShown: false }}
        />
        <Stack.Screen      
          name="SelectGoals"      
          component={SelectGoals}  
          options={{ headerShown: false }}
        />

        {/* 🆕 設定工具頁面 */}
        <Stack.Screen 
          name="ProfileEdit" 
          component={ProfileEditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PrivacySettings" 
          component={PrivacySettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TermsOfService" 
          component={TermsOfServiceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="HelpCenter" 
          component={HelpCenter}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicy}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AboutUs" 
          component={AboutUs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;