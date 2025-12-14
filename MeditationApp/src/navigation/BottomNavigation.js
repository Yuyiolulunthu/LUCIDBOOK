// ==========================================
// 檔案名稱: BottomNavigation.js
// 共用底部導航列組件
// 🎨 白色透明背景 + 藍色漸層滑動指示線
// ✨ 指示線會左右滑動！
// ==========================================

import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==========================================
// 自訂 SVG 圖標元件
// ==========================================

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

const JournalIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
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
    <Path d="M8 2V6" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M16 2V6" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

const ProfileIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.navButtonContent, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <Icon color={isActive ? activeColor : inactiveColor} size={24} />
        </View>
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ==========================================
// 滑動指示線元件
// ==========================================
const SlidingIndicator = ({ activeIndex, tabCount }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  
  // 計算每個 tab 的寬度和指示線位置
  const TAB_WIDTH = (SCREEN_WIDTH - 20) / tabCount; // 扣掉 paddingHorizontal
  const INDICATOR_WIDTH = 36;
  const INDICATOR_OFFSET = (TAB_WIDTH - INDICATOR_WIDTH) / 2 + 10; // 10 是 paddingHorizontal

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeIndex * TAB_WIDTH + INDICATOR_OFFSET,
      friction: 6,      // 較低 = 更彈
      tension: 80,      // 較高 = 更快
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  return (
    <Animated.View
      style={[
        styles.slidingIndicatorContainer,
        { transform: [{ translateX }] },
      ]}
    >
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.slidingIndicator}
      />
    </Animated.View>
  );
};

// ==========================================
// 主元件
// ==========================================
const BottomNavigation = ({ navigation, activeTab, currentRoute }) => {
  // 頁面順序映射
  const routeOrder = {
    'Home': 0,
    'Daily': 1,
    'Profile': 2,
  };

  // 導航項目（已移除練習）
  const navItems = [
    { key: 'home', icon: HomeIcon, label: '首頁', route: 'Home' },
    { key: 'record', icon: JournalIcon, label: '日記', route: 'Daily' },
    { key: 'profile', icon: ProfileIcon, label: '我的', route: 'Profile' },
  ];

  // 取得當前活躍的 key
  const getActiveKey = () => {
    if (activeTab) return activeTab;
    switch (currentRoute) {
      case 'Home': return 'home';
      case 'Daily': return 'record';
      case 'Profile': return 'profile';
      default: return 'home';
    }
  };

  const currentActiveTab = getActiveKey();
  
  // 取得當前活躍的 index
  const getActiveIndex = () => {
    const index = navItems.findIndex(item => item.key === currentActiveTab);
    return index >= 0 ? index : 0;
  };

  // 處理導航（帶滑動方向）
  const handleNavigation = (targetRoute) => {
    const currentOrder = routeOrder[currentRoute] ?? 0;
    const targetOrder = routeOrder[targetRoute] ?? 0;
    const direction = targetOrder > currentOrder ? 'slide_from_right' : 'slide_from_left';
    
    navigation.navigate(targetRoute, { animation: direction });
  };

  return (
    <View style={styles.bottomNavContainer}>
      {/* 白色透明背景 */}
      <View style={styles.menuBackground} />

      {/* ✨ 滑動指示線 */}
      <SlidingIndicator 
        activeIndex={getActiveIndex()} 
        tabCount={navItems.length}
      />

      {/* 導航按鈕列 */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <NavButton
            key={item.key}
            icon={item.icon}
            label={item.label}
            isActive={currentActiveTab === item.key}
            onPress={() => handleNavigation(item.route)}
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
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  // 滑動指示線
  slidingIndicatorContainer: {
    position: 'absolute',
    top: 2,
    left: 0,
    zIndex: 10,
  },
  slidingIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },

  // 導航按鈕列
  bottomNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 8, // 給指示線留空間
    paddingHorizontal: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  navButtonContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#166CB5',
    fontWeight: '600',
  },
});

export default BottomNavigation;