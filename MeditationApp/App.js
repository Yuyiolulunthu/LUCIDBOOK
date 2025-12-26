// ==========================================
// 檔案名稱: App.js 
// 應用主入口 - 改用Tab Navigator
// 版本: V3.2 - 新增思維調節 + 感恩練習路由
// ==========================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 導入自訂底部導航
import BottomNavigation from './src/navigation/BottomNavigation';

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
import GoodThingsJournal from './src/data/practices/GoodthingsJournal';
import EmotionThermometer from './src/data/practices/EmotionThermometer';
import CognitiveReframingPractice from './src/data/practices/CognitiveReframingPractice';
import GratitudePractice from './src/data/practices/GratitudePractice'; // ⭐ 新增

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

// 設定工具頁面
import ProfileEditScreen from './src/screens/account/settings/utils/ProfileEditScreen';
import PrivacySettingsScreen from './src/screens/account/settings/utils/PrivacySettingsScreen';
import TermsOfServiceScreen from './src/screens/account/settings/utils/TermsOfServiceScreen';
import HelpCenter from './src/screens/account/settings/utils/HelpCenter';
import PrivacyPolicy from './src/screens/account/settings/utils/PrivacyPolicy';
import AboutUs from './src/screens/account/settings/utils/AboutUs';
import DeleteAccountScreen from './src/screens/account/settings/utils/DeleteAccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ==========================================
// 主頁面 Tab Navigator（超順滑！）
// ==========================================
const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{
        headerShown: false,
        // ⚡ 懶加載關閉，預先載入所有頁面
        lazy: false,
        // ⚡ 凍結非活躍頁面，提升效能
        freezeOnBlur: true,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Daily" component={DailyScreen} />
      <Tab.Screen name="Profile" component={AccountScreen} />
    </Tab.Navigator>
  );
};

// ==========================================
// 主導航配置
// ==========================================
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
          gestureEnabled: true,
        }}
      >
        {/* ⭐ 主頁面用 Tab Navigator */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ animation: 'none' }}
        />
        
        {/* ========== 首頁子頁面 ========== */}
        <Stack.Screen 
          name="EmotionalResiliencePlan" 
          component={EmotionalResiliencePlanScreen}
        />
        
        {/* ========== 認證相關頁面 ========== */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        
        {/* ========== 練習統計頁面 ========== */}
        <Stack.Screen name="PracticeStats" component={PracticeStatsScreen} />
        
        {/* ========== Explore 頁面 ========== */}
        <Stack.Screen name="PracticeSelection" component={PracticeSelectionScreen} />
        
        {/* ========== 單個練習頁面 ========== */}
        <Stack.Screen 
          name="BreathingPractice" 
          component={BreathingExerciseCard}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="EmotionPractice" 
          component={EmotionPractice}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="MindfulnessPractice" 
          component={MindfulnessPractice}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="SelfAwarenessPractice" 
          component={SelfAwarenessPractice}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="GoodThingsJournal" 
          component={GoodThingsJournal}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen 
          name="EmotionThermometer" 
          component={EmotionThermometer}
          options={{ animation: 'slide_from_bottom' }}
        />
        {/* 思維調節練習 */}
        <Stack.Screen 
          name="CognitiveReframingPractice" 
          component={CognitiveReframingPractice}
          options={{ animation: 'slide_from_bottom' }}
        />
        {/* ⭐ 新增：感恩練習 */}
        <Stack.Screen 
          name="GratitudePractice" 
          component={GratitudePractice}
          options={{ animation: 'slide_from_bottom' }}
        />
        
        {/* ========== 訓練計畫相關頁面 ========== */}
        <Stack.Screen name="TrainingPlanDetail" component={TrainingPlanDetailScreen} />
        <Stack.Screen name="TrainingPlanProgress" component={TrainingPlanProgressScreen} />
        <Stack.Screen name="PracticeNavigator" component={PracticeNavigator} />

        {/* ========== 設定相關頁面 ========== */}
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Feedback" component={Feedback} />
        <Stack.Screen name="Favorites" component={Favorites} />
        <Stack.Screen name="EnterpriseCode" component={EnterpriseCode} />
        <Stack.Screen name="EnterpriseCodeManagement" component={EnterpriseCodeManagement} />
        <Stack.Screen name="SelectGoals" component={SelectGoals} />

        {/* ========== 設定工具頁面 ========== */}
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenter} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="AboutUs" component={AboutUs} />
        <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;