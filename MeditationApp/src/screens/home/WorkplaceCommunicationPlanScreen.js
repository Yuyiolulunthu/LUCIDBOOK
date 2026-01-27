// ==========================================
// 檔案名稱: src/screens/home/WorkplaceCommunicationPlanScreen.js
// 職場溝通力計劃獨立頁面
// 版本: V1.0
// ==========================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ArrowLeft } from 'lucide-react-native';
import WorkplaceCommunicationSeries from './series/WorkplaceCommunicationSeries';

const WorkplaceCommunicationPlanScreen = ({ navigation, route }) => {
  // 從 route 獲取用戶名稱
  const userName = route?.params?.userName;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="rgba(255, 255, 255, 0.8)"
        translucent
      />

      {/* 頂部導航 */}
      <BlurView intensity={80} tint="light" style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <ArrowLeft color="#6B7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>職場溝通力計劃</Text>
          <View style={styles.headerButton} />
        </View>
      </BlurView>

      {/* 內容 */}
      <WorkplaceCommunicationSeries 
        navigation={navigation}
        userName={userName}
      />
    </View>
  );
};

// ==========================================
// 樣式定義
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  // 頂部導航
  headerBlur: {
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
});

export default WorkplaceCommunicationPlanScreen;