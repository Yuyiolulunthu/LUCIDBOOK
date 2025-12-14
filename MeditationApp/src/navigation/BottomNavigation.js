// ==========================================
// 檔案名稱: BottomNavigation.js
// 共用底部導航列組件
// 🎨 白色透明背景(85%) + 藍色漸層選中狀態 + 頂部指示線
// ✨ 支援滑動切換動畫
// ==========================================

import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
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

// 日記 (Journal/Calendar) 圖標
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
// 動畫化的 LinearGradient 包裝器
// ==========================================
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// ==========================================
// 導航按鈕元件 (含動畫)
// ==========================================
const NavButton = ({ icon: Icon, label, isActive, onPress }) => {
  const activeColor = '#166CB5';
  const inactiveColor = '#9CA3AF';
  
  // 動畫值
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive]);

  // 按下效果
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
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        {/* 選中狀態的頂部指示線 (帶動畫) */}
        <View style={styles.indicatorContainer}>
          <Animated.View style={[styles.indicatorWrapper, { opacity: opacityAnim }]}>
            <LinearGradient
              colors={['#166CB5', '#31C6FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeIndicator}
            />
          </Animated.View>
        </View>

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
      </Animated.View>
    </TouchableOpacity>
  );
};

// ==========================================
// 主元件
// ==========================================
const BottomNavigation = ({ navigation, activeTab, currentRoute }) => {
  // 頁面順序映射 (用於判斷滑動方向)
  const routeOrder = {
    'Home': 0,
    'Daily': 1,
    'Profile': 2,
  };

  // 支援 activeTab 或 currentRoute 兩種傳入方式
  const getActiveKey = () => {
    if (activeTab) return activeTab;
    
    switch (currentRoute) {
      case 'Home':
        return 'home';
      case 'Daily':
        return 'record';
      case 'Profile':
        return 'profile';
      default:
        return null;
    }
  };

  const currentActiveTab = getActiveKey();

  // 導航項目 (已移除練習)
  const navItems = [
    {
      key: 'home',
      icon: HomeIcon,
      label: '首頁',
      route: 'Home',
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

  // 處理導航 (帶滑動方向)
  const handleNavigation = (targetRoute) => {
    const currentOrder = routeOrder[currentRoute] ?? 0;
    const targetOrder = routeOrder[targetRoute] ?? 0;
    
    // 根據目標頁面位置決定動畫方向
    const direction = targetOrder > currentOrder ? 'slide_from_right' : 'slide_from_left';
    
    navigation.navigate(targetRoute, {
      animation: direction,
    });
  };

  return (
    <View style={styles.bottomNavContainer}>
      {/* 白色透明背景 */}
      <View style={styles.menuBackground} />

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

  // 指示線容器
  indicatorContainer: {
    width: 36,
    height: 4,
    marginBottom: 4,
  },
  indicatorWrapper: {
    width: '100%',
    height: '100%',
  },
  activeIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },

  // 圖標容器
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },

  // 文字標籤
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