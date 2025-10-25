// ==========================================
// 檔案名稱: BottomNavigation.js
// 共用底部導航列組件 (使用向量圖標)
// ==========================================

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BottomNavigation = ({ navigation, activeTab }) => {
  return (
    <View style={styles.bottomNavContainer}>
      {/* 背景 */}
      <View style={styles.menuBackground} />
      
      {/* 導航按鈕 */}
      <View style={styles.bottomNav}>
        {/* Home 按鈕 */}
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons 
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={28}
            color={activeTab === 'home' ? '#40A1DD' : '#666'}
          />
        </TouchableOpacity>

        {/* Explore 按鈕 */}
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('PracticeSelection')}
        >
          <Ionicons 
            name={activeTab === 'explore' ? 'compass' : 'compass-outline'}
            size={28}
            color={activeTab === 'explore' ? '#40A1DD' : '#666'}
          />
        </TouchableOpacity>

        {/* 中間的每日打卡按鈕 */}
        <TouchableOpacity 
          style={styles.centerNavButton}
          onPress={() => navigation.navigate('DailyCheckIn')}
        >
          <View style={styles.centerButtonCircle}>
            <MaterialCommunityIcons 
              name="calendar-check"
              size={32}
              color="#FFF"
            />
          </View>
        </TouchableOpacity>

        {/* Record/Journal 按鈕 */}
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Daily')}
        >
          <Ionicons 
            name={activeTab === 'record' ? 'book' : 'book-outline'}
            size={28}
            color={activeTab === 'record' ? '#40A1DD' : '#666'}
          />
        </TouchableOpacity>

        {/* Profile 按鈕 */}
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={28}
            color={activeTab === 'profile' ? '#40A1DD' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 94,
  },
  menuBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 94,
    backgroundColor: '#FFF',
    opacity: 0.95,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerNavButton: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#40A1DD',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#40A1DD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default BottomNavigation;