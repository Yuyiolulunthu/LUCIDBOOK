// ==========================================
// 檔案名稱: BottomNavigation.js
// 共用底部導航列組件
// 🎨 白色透明背景(85%) + 藍色漸層選中狀態 + 頂部指示線
// ==========================================

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// ==========================================
// 自訂 SVG 圖標元件 (加粗版 strokeWidth: 2.2)
// ==========================================

// 首頁 (Home) 圖標
const HomeIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 練習 (打開的書本) 圖標
const PracticeIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* 左邊書頁 */}
    <Path
      d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 右邊書頁 */}
    <Path
      d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 日記 (Journal/Calendar) 圖標
const JournalIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* 外框 */}
    <Rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 上方掛勾 */}
    <Path
      d="M8 2V6"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
    <Path
      d="M16 2V6"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
    {/* 橫線 */}
    <Path
      d="M3 10H21"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

// 我的 (Profile/Person) 圖標
const ProfileIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* 頭部 */}
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 身體 */}
    <Path
      d="M4 21V19C4 17.9391 4.42143 16.9217 5.17157 16.1716C5.92172 15.4214 6.93913 15 8 15H16C17.0609 15 18.0783 15.4214 18.8284 16.1716C19.5786 16.9217 20 17.9391 20 19V21"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ==========================================
// 導航按鈕元件
// ==========================================
const NavButton = ({ icon: Icon, label, isActive, onPress }) => {
  const activeColor = '#166CB5';
  const inactiveColor = '#9CA3AF';

  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 選中狀態的頂部指示線 */}
      {isActive ? (
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activeIndicator}
        />
      ) : (
        <View style={styles.inactiveIndicator} />
      )}

      {/* 圖標 */}
      <View style={styles.iconContainer}>
        <Icon color={isActive ? activeColor : inactiveColor} size={24} />
      </View>

      {/* 文字標籤 */}
      <Text style={[
        styles.navLabel,
        isActive && styles.navLabelActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ==========================================
// 主元件
// ==========================================
const BottomNavigation = ({ navigation, activeTab, currentRoute }) => {
  // 支援 activeTab 或 currentRoute 兩種傳入方式
  const getActiveKey = () => {
    if (activeTab) return activeTab;
    
    // 根據 currentRoute 轉換
    switch (currentRoute) {
      case 'Home':
        return 'home';
      case 'PracticeSelection':
        return 'explore';
      case 'Daily':
        return 'record';
      case 'Profile':
        return 'profile';
      default:
        return null;
    }
  };

  const currentActiveTab = getActiveKey();

  const navItems = [
    {
      key: 'home',
      icon: HomeIcon,
      label: '首頁',
      route: 'Home',
    },
    {
      key: 'explore',
      icon: PracticeIcon,
      label: '練習',
      route: 'PracticeSelection',
    },
    {
      key: 'record',
      icon: JournalIcon,
      label: '日記',
      route: 'Daily',
    },
    {
      key: 'profile',
      icon: ProfileIcon,
      label: '我的',
      route: 'Profile',
    },
  ];

  return (
    <View style={styles.bottomNavContainer}>
      {/* 白色透明背景 85% */}
      <View style={styles.menuBackground} />

      {/* 導航按鈕列 */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <NavButton
            key={item.key}
            icon={item.icon}
            label={item.label}
            isActive={currentActiveTab === item.key}
            onPress={() => navigation.navigate(item.route)}
          />
        ))}
      </View>
    </View>
  );
};

// ==========================================
// 樣式
// ==========================================
const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
  },
  menuBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.97)', // 85% 透明度
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  bottomNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 2,
    paddingHorizontal: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  // 頂部指示線 (加粗)
  activeIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  inactiveIndicator: {
    width: 36,
    height: 4,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },

  // 圖標容器
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },

  // 文字標籤 (置中)
  navLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  navLabelActive: {
    color: '#166CB5',
    fontWeight: '600',
  },
});

export default BottomNavigation;